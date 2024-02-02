const DEV = import.meta.env.DEV

interface Content<T> {
	id: string // 'test/filename.md'
	slug: string // 'test/filename'
	body: string
	collection: string // 'posts'
	data: T
}

interface HasDraft {
    draft?: boolean
}


interface HasTitle {
    title: string
}

interface HasCategory {
    category?: string
}


export function filterDraft<T extends HasDraft>(items: Content<T>[]): Content<T>[] {
    if (!DEV) {
        return items.filter(item => item.data.draft !== true);
    }
    return items
}

export function draftTitle<T extends HasDraft & HasTitle>(items: Content<T>[]): Content<T>[] {
    return items.map(item => {
        if (item.data.draft === true) {
            return {
                ...item,
                data: {
                    ...item.data,
                    title: '[DRAFT] ' + item.data.title
                }
            }
        }
        return item
    })
}


export function categorizeByDirectory<T extends HasCategory>(items: Content<T>[]): Content<T>[] {
    return items.map(item => {
        const originalSlug = item.slug
        const sections = originalSlug.split('/')
        if (sections.length == 1) {
            return item
        }
        const category = sections[0]
        const slug = item.data.category == null ? sections[sections.length - 1]: item.data.category
        return {
            ...item,
            slug: slug,
            data: {
                ...item.data,
                category: category,
            }
        }
    })
}


export function simplePostsCollection<T extends HasDraft&HasTitle&HasCategory>(posts: Content<T>[]): Content<T>[] {
    return categorizeByDirectory(draftTitle(filterDraft(posts)))
}


export function simplePostsStaticPaths<T extends HasDraft&HasTitle&HasCategory>(posts: Content<T>[]): {params: {slug: string}, props: {post: Content<T>}}[] {
    return simplePostsCollection(posts).map(post => {
        return {
            params: {slug: post.slug},
            props: {post}
        }
    })
}