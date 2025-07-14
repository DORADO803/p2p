
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export enum ActionType {
  ADD_TASK = 'ADD_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  SET_STATE = 'SET_STATE',
}

export interface AddTaskAction {
  type: ActionType.ADD_TASK;
  payload: { task: Task };
}

export interface UpdateTaskAction {
  type: ActionType.UPDATE_TASK;
  payload: { task: Task };
}

export interface DeleteTaskAction {
  type: ActionType.DELETE_TASK;
  payload: { id: string };
}

export interface SetStateAction {
  type: ActionType.SET_STATE;
  payload: { tasks: Task[] };
}

export type TaskAction = AddTaskAction | UpdateTaskAction | DeleteTaskAction | SetStateAction;

export interface PeerData {
    type: 'action';
    payload: TaskAction;
}

export interface InitialSyncData {
    type: 'initial_sync';
    payload: { tasks: Task[] };
}

export type FullPeerData = PeerData | InitialSyncData;
