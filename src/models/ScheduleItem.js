import { Model } from '@nozbe/watermelondb';
import { date, field, text } from '@nozbe/watermelondb/decorators';

export default class ScheduleItem extends Model {
    static table = 'schedule_items';

    @text('title') title;
    @text('description') description;
    @text('date') date;
    @text('start_time') startTime;
    @text('end_time') endTime;
    @field('alert_time') alertTime;
    @date('created_at') createdAt;
}
