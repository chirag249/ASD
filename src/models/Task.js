import { Model } from '@nozbe/watermelondb';
import { date, field, text } from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
    static table = 'tasks';

    @text('title') title;
    @field('completed') completed;
    @date('created_at') createdAt;
}
