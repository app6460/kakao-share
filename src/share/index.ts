import { IShareTemplate } from '../template';

export type ShareAction = |
    'default' |
    'custom'

export interface IShareForm {
    action: ShareAction;
    roomName: string;
    template: IShareTemplate;
}
