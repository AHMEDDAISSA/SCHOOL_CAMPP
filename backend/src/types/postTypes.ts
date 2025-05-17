export interface PostType {
    email: string;
    title: string;
    description: string;
    category: string;
    published_by: string;
    camp: string;
    is_published: boolean;
    contact_info: string;
    type: string;
    images?: string[];
    imageUrl?: string;
}
