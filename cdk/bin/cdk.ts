#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { DevelopmentStage } from '../lib/stages/development-stage';
import { ProductionStage } from '../lib/stages/production-stage';

const app = new App();

new DevelopmentStage(app, 'Development', {
  env: {account: 'XXXXXXXXXXXX',region: 'us-west-2'},
  apiUrl: 'https://todo-api.miran.me',
  authenticationDomainPrefix: 'todo-application',
  domainName: 'miran.me'
});

new ProductionStage(app, 'Production', {
  env: {account: 'XXXXXXXXXXXX',region: 'us-west-2'},
  apiUrl: 'https://todo-api.miran.me',
  authenticationDomainPrefix: 'todo-application',
  domainName: 'miran.me'
});
