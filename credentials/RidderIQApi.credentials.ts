import {
	Icon,
	ICredentialType,
	INodeProperties,
	IHttpRequestMethods,
	ICredentialTestRequest
} from 'n8n-workflow';

export class RidderIQApi implements ICredentialType {
	name = 'ridderIQApi';
	displayName = 'RidderIQ API';
	icon: Icon = { light: 'file:../../n8n-nodes-ridderiq/icons/ridderiq.svg', dark: 'file:../../n8n-nodes-ridderiq/icons/ridderiq.svg' };
	documentationUrl = 'https://api.eciridderiq.com/v2/index.html';
	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	// ---- CONNECTIVITY TEST ----
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/{{encodeURIComponent($credentials.tenantId)}}/{{encodeURIComponent($credentials.administrationId)}}/v2/crm/todos?page=1&size=1',
			method: 'GET' as IHttpRequestMethods,
			headers: {
				Accept: 'application/json',
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'result', value: true,
					message: 'Connection successful — credentials are valid!',
				},
			},
		],
	};
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.ridderiq.com',
			required: true,
		},
		{
			displayName: 'Tenant ID',
			name: 'tenantId',
			type: 'string',
			default: '',
			placeholder: 'tennantId',
			required: true,
		},
		{
			displayName: 'Administration ID',
			name: 'administrationId',
			placeholder: 'admininstrationId',
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