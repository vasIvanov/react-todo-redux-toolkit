import {createSlice, PayloadAction, configureStore, getDefaultMiddleware, ThunkAction, createAsyncThunk} from '@reduxjs/toolkit';
import {v1 as uuid} from 'uuid';
import {Todo} from './type';
import logger from 'redux-logger';

const todosInitialState: Todo[] = [
  {
    id: uuid(),
    desc: "Learn React",
    isComplete: true
  },
  {
    id: uuid(),
    desc: "Learn Redux",
    isComplete: true
  },
  {
    id: uuid(),
    desc: "Learn Redux-ToolKit",
    isComplete: false
  }
];


// interface IRepoDetails {
//   repos: any
//   error: string | null
// }
// const initialState: IRepoDetails = {
//   repos: [],
//   error: null
// }

// const repoDetails = createSlice({
//   name: 'repoDetails',
//   initialState,
//   reducers: {
//     getReposSuccess(state, action: PayloadAction<IRepoDetails>) {
//       state.repos = action.payload.repos;
//       state.error = null;
//     },
//     getReposFailed(state, action: PayloadAction<string>) {
//       state.repos = [];
//       state.error = action.payload;
//     }
//   }
// });

// const fetchRepos = () => async (dispatch) => {
//   try {
//     const repos: any = await fetch('https://api.github.com/users/vasivanov/repos', {
//       method: 'GET',
//       headers: {
//           'Content-Type': 'application/json',
//       }
//     });
//     dispatch(repoDetails.actions.getReposSuccess(repos))
//   } catch (error) {
//     dispatch(repoDetails.actions.getReposFailed(error.toString()))
//   }
// }

export const fetchRepos: any = createAsyncThunk(
  'repos/fetchRepos',
  async () => {
    const res = await fetch('https://api.github.com/users/vasivanov/repos', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    });
    return res.json();
  }
)
interface IRepos {
  list: Array<any> | null
  status: string | null
}

const initialState: IRepos = {
  list: [],
  status: null
}
const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchRepos.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchRepos.fulfilled]: (state, action) => {
      state.list = action.payload
      state.status = 'completed'
    },
    [fetchRepos.rejected]: (state, action) => {
      state.status = 'failed'
    },
  }
})

const todosSlice = createSlice({
  name: 'todos',
  initialState: todosInitialState,
  reducers: {
    create: {
      reducer: (state, {payload}: PayloadAction<{id: string, desc: string, isComplete: boolean}>) => {
        state.push(payload)
      },
      prepare: ({ desc }: {desc: string}) => ({
        payload: {
          id: uuid(),
          desc,
          isComplete: false
        }
      })
    },
    edit: (state, {payload}: PayloadAction<{id: string, desc: string}>) => {
      const todoToEdit = state.find(todo => todo.id === payload.id);
      if(todoToEdit) {
        todoToEdit.desc = payload.desc;
      }
    },
    toggle: (state, {payload}: PayloadAction<{id: string, isComplete: boolean}>) => {
      const todoToToggle = state.find(todo => todo.id === payload.id);
      if(todoToToggle) {
        todoToToggle.isComplete = payload.isComplete;
      }
    },
    remove: (state, {payload}:  PayloadAction<{id: string}>) => {
      const index = state.findIndex(todo => todo.id === payload.id);
      if(index !== -1) {
        state.splice(index, 1)
      }
    }
  }
});

const selectedTodoSlice = createSlice({
  name: 'selectedTodo',
  initialState: null as string | null,
  reducers: {
    select: (state, {payload}: PayloadAction<{id: string}>) => payload.id
  }
});

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
  extraReducers: {
    [todosSlice.actions.create.type]: state => state + 1,
    [todosSlice.actions.edit.type]: state => state + 1,
    [todosSlice.actions.toggle.type]: state => state + 1,
    [todosSlice.actions.remove.type]: state => state + 1,
  }
});


export const {
  create: createTodoActionCreator,
  edit: editTodoActionCreator,
  remove: deleteTodoActionCreator,
  toggle: toggleTodoActionCreator
} = todosSlice.actions;

export const {
  select: selectTodoActionCreator
} = selectedTodoSlice.actions;


const reducer = {
  todos: todosSlice.reducer,
  selectedTodo: selectedTodoSlice.reducer,
  counter: counterSlice.reducer,
  repos: repoSlice.reducer
}



const middleware = [...getDefaultMiddleware(), logger];
export default configureStore({
  reducer,
  middleware
})