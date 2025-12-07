import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Expense from '../models/Expense';
import ScheduleItem from '../models/ScheduleItem';
import Task from '../models/Task';
import UserSetting from '../models/UserSetting';
import schema from './schema';

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
    schema,
    // (You might want to comment out migration strategies when starting fresh)
    // migrations, 
    // dbName: 'myapp', // optional, defaults to 'watermelon'
    // jsi: true, /* Platform.OS === 'ios' */
    // onSetUpError: error => {
    //   // Database failed to load -- offer the user to reload the app or log out
    // }
});

// Then, make a Watermelon database from it!
const database = new Database({
    adapter,
    modelClasses: [
        Task,
        Expense,
        ScheduleItem,
        UserSetting,
    ],
});

export default database;
