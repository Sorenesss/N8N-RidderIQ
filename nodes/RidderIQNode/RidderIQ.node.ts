import { IHttpRequestMethods, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	NodeApiError
} from 'n8n-workflow';

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
				default: 'v2',
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: 'crm/todos',
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
				placeholder: 'JSON body',
				type: 'json',
				default: '{}',
				displayOptions: { show: { method: ['POST', 'PUT'] } },
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Optional Parameters',
				default: {},
				options: [
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						placeholder: 'crm/todos',
						default: 1,
						description: 'Page number for paginated endpoints.',
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						default: 20,
						description: 'Number of items per page (if supported).',
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Filter',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'Optional filter to apply.',
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'string',
						default: 'id.asc',
						description: 'Sort order for results.',
						//displayOptions: { show: { method: ['GET'] } },
					},
				],
			},
		],	
		//requestDefaults: {
		//	baseURL: '{{$credentials.baseURL}}/{{$credentials.TenantID}}/{{$credentials.AdministrationID}}/{{$parameter.version}}/{{$parameter.endpoint}}',
		//	headers: {
		//		Accept: 'application/json',
		//		'Content-Type': 'application/json',
		//	},
		//},
	};
	

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData= [];

		// Haal de credentials op
		const credentials = await this.getCredentials('ridderIQApi');
		
		// Haal de basisgegevens uit de credentials
		const baseUrl = credentials.baseUrl as string;
		const tenantId = credentials.tenantId as string;
		const administrationId = credentials.administrationId as string;
		const apiKey = credentials.apiKey as string;

		const encodedTenantId = encodeURIComponent(tenantId.trim());
		const encodedAdministrationId = encodeURIComponent(administrationId.trim());

		for (let i = 0; i < items.length; i++) {
			try {
				// Haal de waarden van de node properties op
				const version = this.getNodeParameter('version', i) as string;
				const endpoint = this.getNodeParameter('endpoint', i) as string;
				const method = this.getNodeParameter('method', i) as IHttpRequestMethods;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
					page?: number;
					pageSize?: number;
					filter?: string;
					sort?: string;
				};

				// 1. Construct the complete URL
				// Formaat: Base URL / API Versie / Tenant ID / Administratie ID / Resource
				// Bv: https://api.ridderiq.com/v1/tenantIdValue/administrationIdValue/projects
				const url = `${baseUrl}/${encodedTenantId}/${encodedAdministrationId}/${version}/${endpoint.trim()}`;

				// 2. Construct the Headers
				const headers = {
					'Accept': 'application/json',
					'X-API-KEY': apiKey.trim(), // API Key als custom header
				};

				// 3. Prepare the Body
				let body: object = {};
				if (method === 'POST' || method === 'PUT') {
					try {
						const bodyJson = this.getNodeParameter('bodyJson', i) as string;
						body = JSON.parse(bodyJson);
					} catch (e) {
						throw new Error(`Invalid JSON body: ${e.message}`);
					}
				}

				const qs: Record<string, unknown> = {};

				// Voeg alleen toe als niet leeg of undefined
				if (additionalOptions.pageSize !== undefined) {
					if (additionalOptions.pageSize<=0) {
						throw new NodeOperationError(this.getNode(), 'Page Size must be greater than 0.');
					} else if (additionalOptions.pageSize>200) {
						throw new NodeOperationError(this.getNode(), 'Page Size must not be greater than 200.');
					}
					qs.size = additionalOptions.pageSize;
				} else if (method === 'GET') {
					qs.size = 20; // Standaard page size voor GET verzoeken
				}
				if (additionalOptions.page !== undefined) {
					if (additionalOptions.page<=0) {
						throw new NodeOperationError(this.getNode(), 'Page must be greater than zero.');
					}
					qs.page = additionalOptions.page;
				} else if (method === 'GET') {
					qs.page = 1; // Standaard page nummer voor GET verzoeken
				}
				if (additionalOptions.filter !== undefined  && additionalOptions.filter !== '') {
					qs.filter = encodeURIComponent(additionalOptions.filter);
				}
				if (additionalOptions.sort != undefined && additionalOptions.sort !== '') {
					qs.sort = encodeURIComponent(additionalOptions.sort);
				}

				/*if(true){
					throw new NodeOperationError(this.getNode(), 'RidderIQ API request failed — check your API key or URL.', {
						description: `URL: ${url}\nHeaders: ${JSON.stringify(headers, null, 2)}`
					});
				}*/

				// 4. Maak het API verzoek
				let response = null;
				try{
				response = await this.helpers.httpRequest.call(this, {method: method,
					url: url,
					headers: headers,
					body: body,
					qs:{'size': additionalOptions.pageSize, 'page': additionalOptions.page},
					json: true});
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
				/*if (response && response.statusCode && response.statusCode >= 400) {
					throw new NodeOperationError(this.getNode(), `RidderIQ API returned status ${response.statusCode}`, {
						description: JSON.stringify({
							url,
							method,
							headers,
							body,
							response: response.body || response,
						}, null, 2),
					});
				}*/

				// 5. Voeg de respons toe aan de output
				returnData.push(response);

			} catch (error) {
				// Handelt fouten af en stuurt een foutmelding naar de workflow
				if (this.continueOnFail()) {
					returnData.push(error.message, error.description);
				} else {
					throw error;
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
