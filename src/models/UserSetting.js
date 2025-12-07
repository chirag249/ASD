import { Model } from '@nozbe/watermelondb';
import { date, text } from '@nozbe/watermelondb/decorators';

export default class UserSetting extends Model {
    static table = 'user_settings';

    @text('key') key;
    @text('value') value;
    @date('updated_at') updatedAt;
}
