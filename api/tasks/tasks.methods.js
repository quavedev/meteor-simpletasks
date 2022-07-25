import { check } from 'meteor/check';
import { TasksCollection } from './tasks.collection';
import { Meteor } from 'meteor/meteor';
import { checkLoggedIn } from '../common/auth';

/**
 * Insert a task for the logged user.
 * @param {{ description: String }}
 * @throws Will throw an error if user is not logged in.
 */
const insertTask = async ({ description }) => {
  check(description, String);
  checkLoggedIn();
  await TasksCollection.insertAsync({
    description,
    userId: Meteor.userId(),
    createdAt: new Date(),
  });
};

/**
 * Check if user is logged in and is the task owner.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
const checkTaskOwner = async ({ taskId }) => {
  check(taskId, String);
  checkLoggedIn();
  const task = await TasksCollection.findOneAsync({
    _id: taskId,
    userId: Meteor.userId(),
  });
  if (!task) {
    throw new Meteor.Error('Error', 'Access denied.');
  }
};

/**
 * Remove a task.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
export const removeTask = async ({ taskId }) => {
  await checkTaskOwner({ taskId });
  await TasksCollection.removeAsync({ _id: taskId });
};

/**
 * Toggle task as done or not.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
const toggleTaskDone = async ({ taskId }) => {
  await checkTaskOwner({ taskId });
  const task = await TasksCollection.findOneAsync(taskId);
  await TasksCollection.updateAsync(
    { _id: taskId },
    { $set: { done: !task.done } }
  );
};

/**
 * Register task API methods.
 */
Meteor.methods({
  insertTask,
  removeTask,
  toggleTaskDone,
});
