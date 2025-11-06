import {
	Icon,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RidderIQApi implements ICredentialType {
	name = 'ridderIQApi';
	displayName = 'RidderIQ API';
	icon: Icon = { light: 'file:../../n8n-nodes-ridderiq/icons/ridderiq.svg', dark: 'file:../../n8n-nodes-ridderiq/icons/ridderiq.svg' };
	documentationUrl = 'https://api.ridderiq.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.ridderiq.com',
			required: true,
		},
		{
			displayName: 'Tenant ID',
			name: 'tenantId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Administration ID',
			name: 'administrationId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}