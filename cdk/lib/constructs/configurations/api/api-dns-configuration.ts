import { ApiConstruct } from "../../api-construct";
import { IApiDnsConfiguration } from "./api-dns-configuration-interface";
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApiDnsConfigurationProps{
    domainName: string;
    dnsRecordName: string;
    securityPolicy?:  apigateway.SecurityPolicy;
}

export class ApiDnsConfiguration implements IApiDnsConfiguration {
    domainName: string;
    dnsRecordName: string;
    securityPolicy: apigateway.SecurityPolicy;

    constructor(props: ApiDnsConfigurationProps) {
        this.domainName = props.domainName;
        this.dnsRecordName = props.dnsRecordName;
        this.securityPolicy = props.securityPolicy ?? apigateway.SecurityPolicy.TLS_1_2;
    }

    public configureApiDns(api: ApiConstruct): void {

        const hostedZone = route53.HostedZone.fromLookup(api.stack, 'ApplicationHostedZone', {
            domainName: this.domainName
          });

        const apiCertificate = new acm.DnsValidatedCertificate(api.stack, 'ApiCertificate', {
            domainName: this.domainName,
            hostedZone: hostedZone,
            subjectAlternativeNames: [`*.${this.domainName}`],
        });

        api.addDomainName('ApiDomainName', {
            domainName: this.domainName,
            certificate: apiCertificate,
            securityPolicy: this.securityPolicy
        });

        new route53.ARecord(api.stack, "ApiRecord", {
            recordName:  this.dnsRecordName,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(api))
        });
    }
}