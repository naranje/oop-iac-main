import { ApiConstruct } from '../../api-construct';

export interface IApiDnsConfiguration {
    configureApiDns(api: ApiConstruct): void;
}