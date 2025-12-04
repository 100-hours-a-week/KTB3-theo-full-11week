import { useCallback, useEffect, useRef, useState } from "react";
import { requestPostCardList } from "~/features/shared/lib/api/post-api";
import { PostListHeader } from "./PostListHeader";
import { PostCard } from "./PostCard";
import { PostDetail } from "../post/PostDetail";
import "../../styles/post-list/post-list.css"

type PostSummary = {
    id: number;
    title: string;
    like: number;
    commentCount: number;
    hit: number;
    createdAt: string;
    authorImage: string | null;
    authorNickname: string;
};

export function PostCardList() {
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [page, setPage] = useState(0);
    const size = 10;

    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasNext) {
            return;
        }

        const loadPage = async () => {
            try {
                setIsLoading(true);

                const response = await requestPostCardList(page, size);
                const { contents, hasNext: nextFlag } = response.data;

                // 기존 데이터 뒤에 추가
                setPosts((prev) => {
                    const existingIds = new Set(prev.map((p: PostSummary) => p.id));
                    const deduped = contents.filter((p: PostSummary) => !existingIds.has(p.id));
                    return [...prev, ...deduped];
                });

                // 다음 페이지 여부 저장
                setHasNext(nextFlag);
            } finally {
                setIsLoading(false);
            }
        }

        loadPage();
    }, [page, hasNext]);


    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !isLoading && hasNext) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.5 }
        )

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasNext])

    const handleCardClick = useCallback((postId: number) => {
        setSelectedPostId(postId);
    }, [])

    const handleDeletePost = useCallback((postId: number) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setSelectedPostId(null);
    }, [])

    return (
        <div className="post-card-list-container">
            {selectedPostId !== null ? (
                <PostDetail
                    postId={selectedPostId}
                    onBack={(summary) => {
                        setSelectedPostId(null);
                        setPosts(prev =>
                            prev.map(
                                p => p.id === summary.postId ?
                                    {
                                        ...p,
                                        commentCount: summary.commentCount,
                                        hit: summary.viewCount,
                                        like: summary.likeCount,
                                    }
                                    :
                                    p))
                    }}
                    onDelete={handleDeletePost}
                />
            ) : (
                <>
                    {/* 리스트 헤더 */}
                    <div className="post-card-list-section active">
                        <PostListHeader />

                        {/* 카드 리스트 */}
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                like={post.like}
                                commentCount={post.commentCount}
                                hit={post.hit}
                                createdAt={post.createdAt}
                                authorImage={post.authorImage}
                                authorNickname={post.authorNickname}
                                onClick={handleCardClick}
                            />
                        ))}

                        {/* sentinel */}
                        <div
                            ref={sentinelRef}
                            className="post-card-list-sentinel"
                            style={{ height: "40px" }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}