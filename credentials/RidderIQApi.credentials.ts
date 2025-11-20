import {
	Icon,
	ICredentialType,
	INodeProperties,
	IHttpRequestMethods,
	ICredentialTestRequest,
	IAuthenticateGeneric
} from 'n8n-workflow';

export class RidderIQApi implements ICredentialType {
	name = 'ridderIQApi';
	displayName = 'RidderIQ API';
	icon: Icon = { light: 'file:../icons/ridderiqL.svg', dark: 'file:../icons/ridderiqD.svg' };
	documentationUrl = 'https://api.eciridderiq.com/v2/index.html';

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
				'Accept': 'application/json',
			},
		},
	};

	// ---- CONNECTIVITY TEST ----
	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseUrl}}/{{encodeURIComponent($credentials.tenantId)}}/{{encodeURIComponent($credentials.administrationId)}}/v2/crm/todos?page=1&size=1',
			method: 'GET' as IHttpRequestMethods,
			headers: {
				'Accept': 'application/json',
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 200,
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