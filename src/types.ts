export interface IAlloundItem {
    label: string;
    description?: string;
    detail?: string;
    snippet: string;
    disabled?: boolean;
    languageIds?: string;
}


export interface IAlloundConfig {
    [key: string]: IAlloundItem;
}
