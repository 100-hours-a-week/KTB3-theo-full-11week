import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPostCardList } from "~/features/shared/lib/api/post-api";
import { PostListHeader } from "./PostListHeader";
import { PostCard } from "./PostCard";
import "../../styles/post-list/post-list.css";

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

export function PostCardListPage() {
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [page, setPage] = useState(0);
    const size = 10;

    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // 페이지 로딩
    useEffect(() => {
        if (!hasNext) return;

        const loadPage = async () => {
            try {
                setIsLoading(true);

                const response = await requestPostCardList(page, size);
                const { contents, hasNext: nextFlag } = response.data;

                setPosts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const deduped = contents.filter((p: PostSummary) => !existingIds.has(p.id));
                    return [...prev, ...deduped];
                });

                setHasNext(nextFlag);
            } finally {
                setIsLoading(false);
            }
        };

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
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [isLoading, hasNext]);

    const handleCardClick = useCallback(
        (postId: number) => {
            navigate(`/post/${postId}`);
        },
        [navigate]
    );

    return (
        <div className="post-card-list-container">
            <div className="post-card-list-section active">
                <PostListHeader />

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

                <div
                    ref={sentinelRef}
                    className="post-card-list-sentinel"
                    style={{ height: "40px" }}
                />
            </div>
        </div>
    );
}
