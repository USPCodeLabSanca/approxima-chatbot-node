
export interface IUser {
	_id: number;
	chat_id: number;
	username: string;
	name: string;
	bio: string;
	interests: string[];
	rejects: number[];
	invited: number[];
	pending: number[];
	connections: number[];
	pokes?: number[];
	active: boolean;
	blocked: boolean;

	updated_at: Date;
}
