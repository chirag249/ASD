import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'tasks',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'completed', type: 'boolean' },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'expenses',
            columns: [
                { name: 'amount', type: 'number' },
                { name: 'category', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'schedule_items',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'date', type: 'string' }, // YYYY-MM-DD
                { name: 'start_time', type: 'string' }, // ISO string or similar
                { name: 'end_time', type: 'string' },
                { name: 'alert_time', type: 'number', isOptional: true }, // Timestamp
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'user_settings',
            columns: [
                { name: 'key', type: 'string' },
                { name: 'value', type: 'string' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
    ],
});
