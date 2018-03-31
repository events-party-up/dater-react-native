import { fork, call, take } from 'redux-saga/effects';

// https://github.com/redux-saga/redux-saga/issues/589
// https://github.com/redux-saga/redux-saga/pull/1332
export default function* takeFirst(pattern, saga, ...args) {
  const task = yield fork(function* () {
    while (true) {
      const action = yield take(pattern);
      yield call(saga, ...args.concat(action));
    }
  });
  return task;
}

// const takeFirstOther = (pattern, saga, ...args) => fork(function* () {
//   while (true) {
//     const action = yield take(pattern)
//     yield call(saga, ...args.concat(action))
//   }
// });
