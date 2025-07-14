import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePeer } from '../context/PeerContext';
import { CopyIcon, CheckIcon, PlusIcon, TrashIcon } from './icons';
import { ActionType } from '../types';
import { useLanguage } from '../context/LanguageContext';

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const {
    state,
    connectionStatus,
    dispatchAndBroadcast,
    initializePeer,
    peer,
    connections,
    endSession,
  } = usePeer();
  const [newTaskText, setNewTaskText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }
    if (peer) {
      return;
    }
    const isInitiator = location.state?.isHost === true;
    const isJoining = !isInitiator;
    initializePeer(isJoining, roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate, peer, location.state]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
    };
    dispatchAndBroadcast({ type: ActionType.ADD_TASK, payload: { task: newTask } });
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      dispatchAndBroadcast({ type: ActionType.UPDATE_TASK, payload: { task: updatedTask } });
    }
  };

  const handleDeleteTask = (id: string) => {
    dispatchAndBroadcast({ type: ActionType.DELETE_TASK, payload: { id } });
  };
  
  const handleUpdateTaskText = (id: string, newText: string) => {
     const task = state.tasks.find((t) => t.id === id);
    if (task && task.text !== newText) {
      const updatedTask = { ...task, text: newText };
      dispatchAndBroadcast({ type: ActionType.UPDATE_TASK, payload: { task: updatedTask } });
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLeave = () => {
    endSession();
    navigate('/');
  }
  
  const showPeerCount = connectionStatus.key !== 'connectionStatusDisconnected' && connectionStatus.key !== 'connectionStatusInitializing' && connectionStatus.key !== 'connectionStatusHostDisconnected' && connectionStatus.key !== 'connectionStatusReconnecting';

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            {t('collaborativeListTitle')}
          </h1>
          <div className="text-center text-sm text-slate-400 mb-4">
            {t(connectionStatus.key, connectionStatus.params)}
            {showPeerCount && ` (${connections.length} ${t(connections.length === 1 ? 'peerLabel' : 'peersLabel')})`}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 bg-brand-secondary p-3 rounded-lg">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full bg-slate-900 text-slate-300 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={copyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200"
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
              {copied ? t('copiedButton') : t('copyLinkButton')}
            </button>
          </div>
        </header>

        <main className="bg-brand-secondary p-4 sm:p-6 rounded-lg shadow-lg">
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t('addTaskPlaceholder')}
              className="flex-grow bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
            />
            <button
              type="submit"
              className="bg-brand-primary hover:bg-cyan-500 text-white font-bold p-2 rounded-md transition-colors duration-200 flex-shrink-0"
              aria-label={t('addTaskAriaLabel')}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </form>

          {state.tasks.length > 0 ? (
            <ul className="space-y-3">
              {state.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 bg-slate-800 p-3 rounded-md transition-all duration-300"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-6 h-6 rounded-md flex-shrink-0 border-2 ${task.completed ? 'bg-brand-primary border-brand-primary' : 'border-slate-600'
                      } flex items-center justify-center transition-colors duration-200`}
                    aria-label={t(task.completed ? 'markIncompleteAriaLabel' : 'markCompleteAriaLabel')}
                  >
                    {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={e => handleUpdateTaskText(task.id, e.target.value)}
                    className={`flex-grow bg-transparent focus:outline-none ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                  />
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-500 hover:text-red-500 transition-colors duration-200"
                    aria-label={t('deleteTaskAriaLabel')}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center py-8 text-slate-500">
                <p>{t('emptyListHeader')}</p>
                <p>{t('emptyListSubHeader')}</p>
             </div>
          )}
        </main>
        
        <footer className="text-center mt-6">
          <button onClick={handleLeave} className="text-slate-500 hover:text-slate-300 text-sm underline transition-colors">
            {t('leaveSessionButton')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RoomPage;
