import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class RidderIQ implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RidderIQ',
		name: 'ridderIQ',
        icon: { light: 'file:../../icons/ridderiq.svg', dark: 'file:../../icons/ridderiq.svg' },
		group: ['transform'],
		version: 1,
		description: 'Interact with the RidderIQ API',
		defaults: { name: 'RidderIQ' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'ridderIQApi', required: true }
		],
		properties: [
			{
				displayName: 'API Version',
				name: 'version',
				type: 'options',
				options: [
					{ name: 'v1', value: 'v1' },
					{ name: 'v2', value: 'v2' },
				],
				default: 'v1',
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: 'projects',
				placeholder: 'Enter API endpoint',
				description: 'The API endpoint to call.',
			},
			{
				displayName: 'HTTP Method',
				name: 'method',
				type: 'options',
				options: [
					{ name: 'GET', value: 'GET', routing: {request: {method: 'GET'}} },
					{ name: 'POST', value: 'POST', routing: {request: {method: 'POST'}} },
					{ name: 'PUT', value: 'PUT', routing: {request: {method: 'PUT'}} },
					{ name: 'DELETE', value: 'DELETE', routing: {request: {method: 'DELETE'}} },
				],
				default: 'GET',
			},
			{
				displayName: 'Body',
				name: 'bodyJson',
				type: 'json',
				default: '{}',
				displayOptions: { show: { method: ['POST', 'PUT'] } },
			},
		],
		requestDefaults: {
			baseURL: '{{$credentials.baseURL}}/{{$credentials.TenantID}}/{{$credentials.AdministrationID}}/{{$parameter.version}}/{{$parameter.endpoint}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
	};
}
