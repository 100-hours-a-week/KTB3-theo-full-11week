import { useErrorPage } from "~/features/shared/hooks/error/useErrorPage"

export default function NotFoundRoute() {
    const { NotFoundPage } = useErrorPage();
    return <NotFoundPage></NotFoundPage>
}