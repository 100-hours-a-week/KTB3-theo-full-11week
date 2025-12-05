import { useNavigate } from "react-router";
import { ErrorPage } from "../../components/error/ErrorPage";

export function useErrorPage() {
    const navigate = useNavigate();

    const NotFoundPage = () => {
        return <ErrorPage
            code={404}
            title="페이지를 찾을 수 없습니다."
            description="요청하신 페이지를 찾지 못했어요. 주소가 바뀌었거나, 삭제된 페이지일 수 있어요."
            hint="주소를 다시 확인하시거나, 오늘의 시세와 이야기가 있는 페이지로 돌아가 주세요."
            primaryLabel="오늘의 수산 홈으로"
            secondaryLabel="시세·이야기 보러가기"
            onPrimary={() => navigate("/login")}
            onSecondary={() => navigate("/postlist")}
        />
    }

    const ServerErrorPage = () => {
        return <ErrorPage
            code={500}
            title="서버에서 요청을 처리할 수 없습니다."
            description="서버에서 요청을 처리하는 중 문제가 발생했어요."
            hint="잠시 후 다시 시도해 주세요. 문제가 계속되면, 브라우저를 새로고침하거나 나중에 다시 접속해 주세요."
            primaryLabel="새로고침"
            secondaryLabel="로그인 화면으로 이동"
            onPrimary={() => window.location.reload()}
            onSecondary={() => navigate("/login")}
        />
    }

    return { NotFoundPage, ServerErrorPage };
}