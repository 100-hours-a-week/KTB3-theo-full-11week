import { useErrorPage } from "~/features/shared/hooks/error/useErrorPage"

export default function AccessBlockRoute() {
    const { NotFoundPage } = useErrorPage();
    return <NotFoundPage></NotFoundPage>
}