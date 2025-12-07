import { Model } from '@nozbe/watermelondb';
import { date, field, text } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
    static table = 'expenses';

    @field('amount') amount;
    @text('category') category;
    @text('description') description;
    @date('created_at') createdAt;
}
