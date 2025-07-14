import React, { createContext, useReducer, useContext, ReactNode, useCallback, useState } from 'react';
import type { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import { Task, TaskAction, ActionType, FullPeerData } from '../types';

interface AppState {
  tasks: Task[];
}

const initialState: AppState = {
  tasks: [],
};

const tasksReducer = (state: AppState, action: TaskAction): AppState => {
  switch (action.type) {
    case ActionType.ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload.task] };
    case ActionType.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.task.id ? action.payload.task : task
        ),
      };
    case ActionType.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    case ActionType.SET_STATE:
      return { ...state, tasks: action.payload.tasks };
    default:
      return state;
  }
};

interface ConnectionStatus {
    key: string;
    params?: Record<string, string>;
}

interface PeerContextType {
  peer: Peer | null;
  myPeerId: string;
  connections: DataConnection[];
  isHost: boolean;
  state: AppState;
  connectionStatus: ConnectionStatus;
  dispatchAndBroadcast: (action: TaskAction) => void;
  initializePeer: (isJoining: boolean, hostId?: string) => void;
  endSession: () => void;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export const PeerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ key: 'connectionStatusDisconnected' });

  const broadcast = useCallback((data: FullPeerData) => {
    connections.forEach((conn) => conn.send(data));
  }, [connections]);

  const dispatchAndBroadcast = (action: TaskAction) => {
    dispatch(action); // Dispatch locally immediately
    broadcast({ type: 'action', payload: action });
  };
  
  const endSession = () => {
    peer?.destroy();
    setPeer(null);
    setMyPeerId('');
    setConnections([]);
    setIsHost(false);
    setConnectionStatus({ key: 'connectionStatusDisconnected' });
    dispatch({type: ActionType.SET_STATE, payload: {tasks: []}});
  }

  const handleNewConnection = useCallback((conn: DataConnection) => {
    setConnectionStatus({ key: 'connectionStatusPeerConnected', params: { peerId: conn.peer.slice(0, 6) } });
    setConnections(prev => [...prev, conn]);

    conn.on('open', () => {
      // Send the entire current state to the new peer
      conn.send({ type: 'initial_sync', payload: { tasks: state.tasks } });
    });

    conn.on('data', (data) => {
      const { type, payload } = data as FullPeerData;
      if (type === 'action') {
        dispatch(payload);
        // Relay this action to all other peers
        connections.forEach(c => {
          if (c.peer !== conn.peer) {
            c.send({type: 'action', payload});
          }
        });
      }
    });

    conn.on('close', () => {
      setConnectionStatus({ key: 'connectionStatusPeerLeft', params: { peerId: conn.peer.slice(0, 6) } });
      setConnections(prev => prev.filter(c => c.peer !== conn.peer));
    });
  }, [state.tasks, connections]);


  const initializePeer = (isJoining: boolean, hostId?: string) => {
    // @ts-ignore Peer is loaded from CDN
    const newPeer = new Peer(isJoining ? undefined : hostId);
    setPeer(newPeer);
    setConnectionStatus({ key: 'connectionStatusInitializing' });

    newPeer.on('open', (id) => {
      setMyPeerId(id);
      if (isJoining && hostId) {
        setIsHost(false);
        setConnectionStatus({ key: 'connectionStatusConnecting', params: { hostId: hostId.slice(0, 6) } });
        const conn = newPeer.connect(hostId, { reliable: true });
        
        conn.on('open', () => {
            setConnectionStatus({ key: 'connectionStatusConnectedToHost', params: { hostId: hostId.slice(0, 6) } });
            setConnections([conn]);
        });
        
        conn.on('data', (data) => {
          const { type, payload } = data as FullPeerData;
          if (type === 'initial_sync') {
            dispatch({ type: ActionType.SET_STATE, payload: payload });
          } else if (type === 'action') {
            dispatch(payload);
          }
        });

        conn.on('close', () => {
            setConnectionStatus({ key: 'connectionStatusHostDisconnected' });
            endSession();
        });

      } else {
        setIsHost(true);
        setConnectionStatus({ key: 'connectionStatusWaiting' });
      }
    });

    newPeer.on('connection', handleNewConnection);

    newPeer.on('error', (err) => {
      console.error(err);
      setConnectionStatus({ key: 'connectionStatusError', params: { errorMessage: err.message } });
    });
    
    newPeer.on('disconnected', () => {
        setConnectionStatus({ key: 'connectionStatusReconnecting' });
        newPeer.reconnect();
    });
  };

  const value = {
    peer,
    myPeerId,
    connections,
    isHost,
    state,
    connectionStatus,
    dispatchAndBroadcast,
    initializePeer,
    endSession,
  };

  return <PeerContext.Provider value={value}>{children}</PeerContext.Provider>;
};

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (context === undefined) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};
