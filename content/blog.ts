const DEV = import.meta.env.DEV

export interface ContentEntry<T> {
	id: string          // 'test/filename.md'
	slug: string        // 'test/filename'
	body: string
	collection: string  // 'posts'
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

interface HasCreatedAt {
    createdAt?: Date
}


type ContentCollection<T> = ContentEntry<T>[]


export function noop<T>(items: ContentCollection<T>): ContentCollection<T> {
    return items
}

export function filterDraft<T extends HasDraft>(items: ContentCollection<T>): ContentCollection<T> {
    if (!DEV) {
        return items.filter(item => item.data.draft !== true);
    }
    return items
}


export function draftTitle<T extends HasDraft & HasTitle>(items: ContentCollection<T>): ContentCollection<T> {
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


export function extractCategory<T extends HasCategory>(items: ContentCollection<T>, {removeFromSlug=false}={}): ContentCollection<T> {
    return items.map(item => {
        const originalSlug = item.slug
        const sections = originalSlug.split('/', 2)
        if (sections.length == 1) {
            return item
        }
        const category = sections[0]
        const slug = removeFromSlug ? sections[sections.length - 1]: item.slug
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

export function extractCreatedAt<T extends HasCreatedAt>(items: ContentCollection<T>, {removeFromSlug = true} = {}): ContentCollection<T> {
    return items.map(item => {
        const originalSlug = item.slug
        const sections = originalSlug.split('/')
        let lastSection = sections.pop()!

        let createdAt: Date|undefined = item.data.createdAt
        if (/^\d{6}[_-]/.test(lastSection)) {
            if (createdAt == null) {
                createdAt = new Date(`20${lastSection.slice(0, 2)}-${lastSection.slice(2, 4)}-${lastSection.slice(4,6)}`)
            }
            lastSection = lastSection.slice(7)
        }

        console.log({removeFromSlug})
        const slug = removeFromSlug ? [...sections, lastSection].join('/'): item.slug
        return {
            ...item,
            slug: slug,
            data: {
                ...item.data,
                createdAt: createdAt,
            }
        }
    })
}


interface StaticPathConfig<T> {
    params: {slug: string},
    props: {content: ContentEntry<T>}
}

export function contentCollectionToStaticPaths<T>(collection: ContentCollection<T>): StaticPathConfig<T>[] {
    return collection.map(item => {
        return {
            params: {slug: item.slug},
            props: {content: item}
        }
    })
}
