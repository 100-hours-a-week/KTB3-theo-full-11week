import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { postCard } from "./post-card.js";
import { postCardListHeader } from "./post-card-list-header.js";
import { requestPostCardList } from "../../../../../shared/lib/api/post-api.js";
import { emit, eventBus } from "../../../../../shared/lib/eventBus.js";
import { post } from "../../post/js/post.js";

activeFeatureCss(cssPath.POST_CARD_LIST_CSS_PATH);

export function postCardList() {
    // 현재 페이지
    let currentPage = 0;
    // 페이지당 컨텐츠 개수
    const size = 10;
    // 다음 페이지 여부
    let hasNext = true;
    // 페이지 로딩 플래그
    let isLoading = false;

    const root = document.createElement('div');
    root.className = 'post-card-list-container';

    // 게시글 목록 화면용 섹션
    const listSection = document.createElement('div');
    listSection.className = 'post-card-list-section';
    listSection.classList.add('active');

    listSection.appendChild(postCardListHeader());

    // 무한 스크롤용 sentinel 박스 생성
    const sentinel = document.createElement('div');
    sentinel.className = 'post-card-list-sentinel';
    listSection.appendChild(sentinel);


    // 게시글 상세페이지 섹션
    const detailSection = document.createElement('div');
    detailSection.className = 'post-detail-section';

    root.appendChild(listSection);
    root.appendChild(detailSection);


    // 게시글 목록 화면 옵저버 추가
    let nowObserver = null;
    addObserver();
    // 초기 페이지 로드
    loadNextPage();

    async function postCardClickHandler(event) {
        const { postId } = event.detail;
        listSection.classList.remove('active');
        const postComponent = await post(postId);
        detailSection.appendChild(postComponent);
        detailSection.classList.add('active');
    }

    // postCard 클릭 시 -> 상세 화면으로 전환
    eventBus.addEventListener('post:postCardClick', postCardClickHandler);

    function postBackToListHander(event) {
        detailSection.classList.remove('active');
        detailSection.innerHTML = '';
        listSection.classList.add('active');
        const { postId, nowCommentCount, nowViewCount, nowLikeCount } = event.detail;
        emit(`post:updatePostCard/${postId}`, { nowCommentCount, nowViewCount, nowLikeCount });
    }

    // PostCar에서 '목록으로'버튼 클릭시 게시글 리스트로 전환
    eventBus.addEventListener('post:backToList', postBackToListHander);

    function deletePostHandler(event) {
        const deletedPostId = event.detail.postId;
        const deletedPostContainer = detailSection.querySelector(`#post-container-${deletedPostId}`);
        detailSection.removeChild(deletedPostContainer);
        listSection.classList.add('active');
        const deletedPostCard = listSection.querySelector(`#post-card-${deletedPostId}`);
        deletedPostCard.cleanUp();
        listSection.removeChild(deletedPostCard);
    }

    // 게시글 삭제 시 post Card List에서 삭제
    eventBus.addEventListener('post:deletePost', deletePostHandler);


    // 무한 스크롤용 옵저버 추가
    function addObserver() {
        nowObserver = new IntersectionObserver(async (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading && hasNext) {
                await loadNextPage();
            }
        }, { threshold: 0.5 });

        nowObserver.observe(sentinel);
    }

    // 무한 스크롤 시 페이지 로딩 함수
    async function loadNextPage() {
        try {

            // 로딩 중이거나 다음 페이지 없으면 페이지 로드 X
            if (isLoading || !hasNext) {
                return;
            }

            // 페이지 로드 시작
            isLoading = true;

            const response = await requestPostCardList(currentPage, size);
            const responseBody = response.data;

            // Post 렌더링
            const contents = responseBody.contents;
            const fragment = document.createDocumentFragment();
            contents.forEach((post) => {
                fragment.append(postCard(post));
            })
            listSection.insertBefore(fragment, sentinel);

            // 다음 로드 페이지 계산
            currentPage = responseBody.currentPage + 1;
            // 다음 페이지 여부
            hasNext = responseBody.hasNext;
        } catch (error) {
            if (error instanceof ApiError) {
                // TODO : API 에러 처리
            }
        } finally {
            isLoading = false;
        }
    }

    const customEvent = [
        { type: 'post:postCardClick', handler: postCardClickHandler },
        { type: 'post:backToList', handler: postBackToListHander },
        { type: 'post:deletePost', handler: deletePostHandler },
    ]

    root.cleanUp = function () {
        const cards = root.querySelectorAll('.post-card-container');
        cards.forEach((card) => {
            card?.cleanUp?.();
        })

        customEvent.forEach((customEvent) => {
            eventBus.removeEventListener(customEvent.type, customEvent.handler);
        })

        if (nowObserver) {
            nowObserver.disconnect();
            nowObserver = null;
        }
    }
    return root;
}