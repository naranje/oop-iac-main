import { WebsiteBucket } from "../website-bucket-construct";

export interface IWebsiteConfigurationStrategy {
    configureWebsite(websiteBucket: WebsiteBucket): void;
    getWebsiteUrl(): string;
}