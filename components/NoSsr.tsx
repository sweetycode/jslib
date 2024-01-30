import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function NoSsr({children}: {children: ComponentChildren}) {
    const [flag, setFlag] = useState(false)
    useEffect(() => {
        setFlag(true)
    }, [])

    return flag ? children: <></>
}