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
		documentationUrl: 'https://api.eciridderiq.com/v2/index.html',
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
		usableAsTool: true,
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
				required: true
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
				required: true
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: 'crm/todos',
				description: 'The API endpoint to call.',
				required: true
			},
			{
				displayName: 'Body',
				name: 'bodyJson',
				placeholder: 'JSON body',
				type: 'json',
				default: '{}',
				description: 'The JSON body to send with the request.',
				displayOptions: { show: { method: ['POST', 'PUT'] } },
				required: true
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
						required: false
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						default: 20,
						description: 'Number of items per page (if supported).',
						required: false
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'string',
						default: 'id.asc',
						description: 'Sort order for results.',
						required: false
						//displayOptions: { show: { method: ['GET'] } },
					},
					{
						displayName: 'Filter Mode',
						name: 'filterMode',
						type: 'options',
						options: [
							{ name: 'Filter Builder (simple)', value: 'simple' },
							{ name: 'Filter Query (advanced)', value: 'advanced' },
						],
						default: 'simple',
						description: 'Choose between simple UI builder or advanced text format for complex filter combinations.',
					},
					{
						displayName: 'Filter Builder',
						name: 'filters',
						description: 'Optional filter(s) to apply.',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Filter',
						},
						default: {
							filter: [
								{
									field: '',
									operator: 'eq',
									value: '',
									value2: ''
								},
							],
						},
						displayOptions: {
							show: {
								filterMode: ['simple'],
							},
						},
						options: [
							{
								name: 'filter',
								displayName: 'Filter',
								values: [
									{
										displayName: 'Field',
										name: 'field',
										type: 'string',
										default: '',
										placeholder: 'field',
										required: false,
									},
									{
										displayName: 'Operator',
										name: 'operator',
										type: 'options',
										options: [
											{ name: 'Equal', value: 'eq' },
											{ name: 'Not Equal', value: 'ne' },
											{ name: 'Greater Than', value: 'gt' },
											{ name: 'Greater Than or Equal', value: 'gte' },
											{ name: 'Less Than', value: 'lt' },
											{ name: 'Less Than or Equal', value: 'lte' },
											{ name: 'Contains', value: 'contains' },
											{ name: 'Starts With', value: 'startsWith' },
											{ name: 'Ends With', value: 'endsWith' },
											{ name: 'Like', value: 'like' },
											{ name: 'In', value: 'in' },
											{ name: 'Between', value: 'between' },
										],
										default: 'eq',
										required: false,
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										placeholder: 'Test or 123',
										required: false,
									},
									{
										displayName: 'Value 2',
										name: 'value2',
										type: 'string',
										default: '',
										placeholder: 'Voor between operator',
										required: false,
										displayOptions: {
											show: {
												operator: ['between'],
											},
										},
									}
								],
							},
						],
					},
					{
                        displayName: 'Filter Query',
                        name: 'advancedFilterQuery',
                        type: 'string',
                        typeOptions: {
                            rows: 4,
                        },
                        default: '',
                        placeholder: 'name=="test" AND age>20',
                        description: 'Enter your RSQL/Filter query manually.',
                        displayOptions: {
                            show: {
                                filterMode: ['advanced'],
                            },
                        },
                    },
				],
			},
		],	
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
                    sort?: string;
                    filterMode?: string;
                    filters?: { filter: Array<{ field: string, operator: string, value: string, value2: string }> };
                    advancedFilterQuery?: string;
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

				const qs: JsonObject = {};

				if (additionalOptions.pageSize) {
                    if (additionalOptions.pageSize <= 0 || additionalOptions.pageSize > 200) {
                        throw new NodeOperationError(this.getNode(), 'Page Size must be between 1 and 200.');
                    }
                    qs.size = additionalOptions.pageSize;
                } else if (method === 'GET') {
                    qs.size = 20;
                }

                if (additionalOptions.page) {
                     if (additionalOptions.page <= 0) throw new NodeOperationError(this.getNode(), 'Page must be > 0');
                    qs.page = additionalOptions.page;
                } else if (method === 'GET') {
                    qs.page = 1;
                }

                if (additionalOptions.sort) {
                    qs.sort = additionalOptions.sort;
                }

                // --- FILTER LOGICA (Nu opgehaald uit additionalOptions) ---
                if (method === 'GET' && additionalOptions.filterMode) {
                    let filterString = '';

                    if (additionalOptions.filterMode === 'simple' && additionalOptions.filters && additionalOptions.filters.filter) {
                        const parts = [];
                        
                        // Functie om stringwaarden te quoten, tenzij het puur nummers, booleans of functies zijn
                        const quoteValue = (val: string): string => {
                             if (!val) return '""'; // Lege string
                            
                            // Check of het een nummer, boolean of dynamische functie is
                            if (/^\d+(\.\d+)?$/.test(val) || /^(true|false)$/i.test(val) || /\w+\(\s*.*\s*\)/.test(val)) {
                                return val; // Laat staan
                            }
                            
                            // Anders: quote de string en escape interne quotes
                            return `"${val.replace(/"/g, '\\"')}"`;
                        };
                        
                        // Hier mappen we de n8n UI filters naar de RidderIQ filter syntax
                        for (const item of additionalOptions.filters.filter) {
                            const { field, operator, value, value2 } = item;
                            
                            if (!field || !value) continue;

                            let formattedValue = '';
                            const lowerCaseOp = operator.toLowerCase();

                            if (lowerCaseOp === 'between') {
                                // BETWEEN gebruikt (value1, value2)
                                if (!value2) continue; // Skip als value2 mist
                                
                                // Quoten is hier lastig omdat de API mogelijk een mix van types verwacht,
                                // maar de API docs tonen voor data/ID's geen quotes in de paren.
                                // We quoten alleen als de waarde duidelijk een string is. We gebruiken de ruwe waarden hier.
                                formattedValue = `(${quoteValue(value)}, ${quoteValue(value2)})`;

                            } else if (lowerCaseOp === 'in') {
                                // IN verwacht een lijst (value1, value2, ...)
                                // De gebruiker moet de lijst waarschijnlijk zelf als string '(1, "A", 3)' in het 'Value' veld invoeren.
                                formattedValue = value; 
                                if (!formattedValue.startsWith('(') || !formattedValue.endsWith(')')) {
                                     // Dwing de paren af als de gebruiker ze vergeten is
                                     formattedValue = `(${value})`;
                                }
                                
                            } else {
                                // Standaard operators (eq, gt, like, etc.)
                                formattedValue = quoteValue(value);
                            }

                            // De filter string opbouwen: propertyName[operator]formattedValue
                            parts.push(`${field}[${operator}]${formattedValue}`);
                        }
                        
                        if (parts.length > 0) {
                            // Verbind filters met 'and'
                            filterString = parts.join(' and ');
                        }

                    } else if (additionalOptions.filterMode === 'advanced' && additionalOptions.advancedFilterQuery) {
                        filterString = additionalOptions.advancedFilterQuery;
                    }

                    if (filterString) {
                        qs.filter = filterString;
                    }
                }

				// 4. Maak het API verzoek
				let response = null;
				try{
				response = await this.helpers.httpRequest.call(this, {method: method,
					url: url,
					headers: headers,
					body: body,
					qs:qs,
					json: true});
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}

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
