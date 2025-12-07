import database from '../database';

const tasksCollection = database.collections.get('tasks');

export const getAllTasks = async () => {
    const tasks = await tasksCollection.query().fetch();
    return tasks;
};

export const observeTasks = () => {
    return tasksCollection.query().observe(); // Observes changes to the entire list
};

export const createTask = async ({ title }) => {
    return await database.write(async () => {
        return await tasksCollection.create(task => {
            task.title = title;
            task.completed = false;
            task.createdAt = new Date();
        });
    });
};

export const toggleTaskCompletion = async (taskId) => {
    return await database.write(async () => {
        const task = await tasksCollection.find(taskId);
        await task.update(t => {
            t.completed = !t.completed;
        });
    });
};

export const updateTask = async (taskId, { title }) => {
    return await database.write(async () => {
        const task = await tasksCollection.find(taskId);
        await task.update(t => {
            if (title !== undefined) t.title = title;
        });
    });
};

export const deleteTask = async (taskId) => {
    return await database.write(async () => {
        const task = await tasksCollection.find(taskId);
        await task.markAsDeleted();
        await task.destroyPermanently(); // Explicitly removing it
    });
};
