import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import mockPosts from '../data/mockPosts';
import {
    setPosts,
    setPreviewPost,
    toggleSelect,
    toggleSelectAll,
    updateStatus,
    batchUpdateStatus,
    openRejectionModal,
    closeRejectionModal,
    setRejectionReason,
    setFilterStatus,
    undoStatus,
    clearRecentAction,
    openPreviewModal,
    closePreviewModal,
} from '../features/posts/postsSlice';
import toast from 'react-hot-toast';
import { Keyboard } from 'lucide-react';

export default function ModerationQueue() {

    const dispatch = useDispatch();
    useEffect(() => {

        setTimeout(() => {
            dispatch(setPosts(mockPosts));
        }, 500);
    }, [dispatch]);

    const [actionFeedback, setActionFeedback] = useState(null);
    const posts = useSelector((state) => {
        const { allPosts, filterStatus } = state.posts;
        return allPosts.filter((post) => post.status === filterStatus);
    });
    const [isShortcutDialogOpen, setShortcutDialogOpen] = useState(false);
    const selected = useSelector((state) => state.posts.selected);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const isLoading = useSelector((state) => state.posts.isLoading);

    const totalPages = Math.ceil(posts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);
    const { isOpen, postId, reason } = useSelector((state) => state.posts.rejectionModal);
    const isAllSelected =
        posts.filter((p) => p.status === 'pending').length === selected.length;

    const filterStatus = useSelector((state) => state.posts.filterStatus);
    const allPosts = useSelector((state) => state.posts.allPosts);

    const statusCounts = {
        pending: allPosts.filter((p) => p.status === 'pending').length,
        approved: allPosts.filter((p) => p.status === 'approved').length,
        rejected: allPosts.filter((p) => p.status === 'rejected').length,
    };

    const statusTabs = ['pending', 'approved', 'rejected'];

    //keyboard shortcuts    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                dispatch(undoStatus());
                toast.success("Undo performed");
            }

            if (e.key === 'a' || e.key === 'A') {
                if (selected.length > 0) {
                    handleBatchAction('approved');
                }
            }

            if (e.key === 'r' || e.key === 'R') {
                if (selected.length > 0) {
                    handleBatchAction('rejected');
                }
            }

            if (e.key === "Escape") {
                dispatch(closePreviewModal());
                setShortcutDialogOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selected, dispatch]);


    //updates post(s) status
    const handleUpdateStatus = (id, newStatus) => {
        dispatch(updateStatus({ postId: id, status: newStatus }));

        const toastId = toast(
            (t) => (
                <div className="text-sm">
                    Post {newStatus === 'approved' ? 'approved' : 'rejected'}.
                    <button
                        className="ml-3 text-blue-600 underline"
                        onClick={() => {
                            dispatch(undoStatus());
                            toast.dismiss(t.id);
                        }}
                    >
                        Undo
                    </button>
                </div>
            ),
            {
                duration: 5000,
            }
        );

        // After 5 seconds, clear undo opportunity
        setTimeout(() => {
            dispatch(clearRecentAction());
        }, 5000);
    };


    //updates batch post(s)
    const handleBatchAction = (status) => {
        dispatch(batchUpdateStatus({ ids: selected, status }));

        toast((t) => (
            <div className="text-sm">
                {selected.length} post(s) {status}.
                <button
                    className="ml-3 text-blue-600 underline"
                    onClick={() => {
                        dispatch(undoStatus());
                        toast.dismiss(t.id);
                    }}
                >
                    Undo
                </button>
            </div>
        ), {
            duration: 5000,
        });

        dispatch(clearSelection());
        setTimeout(() => dispatch(clearRecentAction()), 5000);
    };




    //dialog for keyboard shortcuts
    function KeyboardShortcutsDialog({ isOpen, onClose }) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><kbd className="font-mono">A</kbd> – Approve selected post(s)</li>
                        <li><kbd className="font-mono">R</kbd> – Reject selected post(s)</li>
                        <li><kbd className="font-mono">Ctrl/Cmd + Z</kbd> – Undo last action</li>
                        <li><kbd className="font-mono">esc</kbd> – close preview modal</li>
                    </ul>
                    <div className="mt-6 text-right">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    //handles image in preview modal (errors and loading state)
    function PostImage({ src, alt }) {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(false);

        return (
            <div className="relative w-full h-64 mb-4">
                {/* Loader */}
                {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                        <span className="text-gray-500 text-sm">Loading image...</span>
                    </div>
                )}

                {/* Error fallback */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded">
                        <span className="text-red-500 text-sm">Failed to load image</span>
                    </div>
                )}

                {/* Actual image */}
                {!error && (
                    <img
                        src={src}
                        alt={alt}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                        className={`w-full h-64 object-cover rounded transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"
                            }`}
                    />
                )}
            </div>
        );
    }


    //content preview modal
    function ContentPreviewModal() {
        const dispatch = useDispatch();

        const { isOpen, postId } = useSelector((state) => state.posts.previewModal);
        const allPosts = useSelector((state) => state.posts.allPosts);
        const post = allPosts.find((p) => p.id === postId);
        const currentIndex = allPosts.findIndex((p) => p.id === postId);

        if (!isOpen || !post) return null;

        return (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
                <div className="bg-white w-full max-w-2xl p-6 rounded shadow-xl relative">
                    {/* Close button */}
                    <button
                        onClick={() => dispatch(closePreviewModal())}
                        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                        aria-label="Close preview"
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <h2 className="text-2xl font-bold mb-1">{post.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Posted by <strong>{post.author.username}</strong> on{" "}
                        {new Date(post.reportedAt).toLocaleDateString()}
                    </p>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700 mb-4">
                        <div>
                            <span className="font-semibold">Post ID:</span> {post.id}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span> {post.status}
                        </div>
                        <div>
                            <span className="font-semibold">Reported Reason:</span> {post.reportedReason}
                        </div>
                        <div>
                            <span className="font-semibold">Report Count:</span> {post.reportCount || 0}
                        </div>
                        {post.rejectionReason && (
                            <div className="col-span-2">
                                <span className="font-semibold">Rejection Note:</span> {post.rejectionReason}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <hr className="my-4 border-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Content</h3>

                    {/* Post Content */}
                    <div className="prose max-w-full mb-4">{post.content}</div>

                    {/* Image (optional) */}
                    {post.imageUrl && <PostImage src={post.imageUrl} alt={post.title} />}

                    {/* Action Buttons */}
                    {post.status === 'pending' && (
                        <div className="flex justify-center gap-8 mt-6 mb-6">
                            <button
                                onClick={() => handleUpdateStatus(post.id, 'approved')}
                                className="px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-green-300 text-green-700 bg-green-200 rounded bg-opacity-50 transition"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(closePreviewModal());
                                    setTimeout(() => {
                                        dispatch(openRejectionModal(post.id));
                                    }, 300); // adjust the delay as per your modal transition time
                                }}
                                className="px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-red-300 text-red-700 bg-red-200 rounded bg-opacity-50 transition"
                            >
                                Reject
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-10">
                        <button
                            disabled={currentIndex <= 0}
                            onClick={() =>
                                dispatch(setPreviewPost(allPosts[currentIndex - 1].id))
                            }
                            className="px-3 py-1 rounded-lg bg-gray-200 text-black-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            ← Previous
                        </button>

                        <button
                            disabled={currentIndex >= allPosts.length - 1}
                            onClick={() =>
                                dispatch(setPreviewPost(allPosts[currentIndex + 1].id))
                            }
                            className="px-3 py-1 rounded-lg bg-gray-200 text-black-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white-400 via-gray-800 to-black-800 mb-10">
                Content Moderation Queue
            </h1>

            <div className="overflow-x-auto shadow-lg z-10 relative rounded bg-white m-8">
                {actionFeedback && (
                    <div className="mb-4 text-sm text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded">
                        {actionFeedback}
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <div className="mb-6 flex gap-4">
                        {statusTabs.map((status) => (
                            <button
                                key={status}
                                onClick={() => dispatch(setFilterStatus(status))}
                                className={`px-4 py-2 rounded-t-lg border-b-2 transition-all duration-200 ${filterStatus === status
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-blue-500'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
                                    {statusCounts[status]}
                                </span>
                            </button>
                        ))}

                    </div>
                    {filterStatus === 'pending' && (
                        <div className='me-5'>
                            <button
                                onClick={() => dispatch(toggleSelectAll())}
                                className="text-sm text-blue-600 underline"
                            >
                                {isAllSelected ? 'Unselect All' : 'Select All'}
                            </button>
                        </div>
                    )}
                </div>


                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="w-10 p-3 text-sm font-semibold tracking-wide text-center align-middle">
                                <div className="flex justify-center items-center h-full">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={() => dispatch(toggleSelectAll())}
                                    />
                                </div>
                            </th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Title</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">User</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Reason</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Date</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                            {filterStatus === 'rejected' && (
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Rejection Note</th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg
                                            className="animate-spin h-6 w-6 text-blue-500 mb-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 100 20v-4l-5 5 5 5v-4a8 8 0 01-8-8z"
                                            ></path>
                                        </svg>
                                        <p className="text-gray-500 text-sm">Loading posts...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : currentPosts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500 text-sm">
                                    No posts found in <span className="capitalize">{filterStatus}</span> tab.
                                </td>
                            </tr>
                        ) : (
                            currentPosts.map((post, index) => (
                                <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-3 text-sm text-gray-700 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(post.id)}
                                            onChange={() => dispatch(toggleSelect(post.id))}
                                            disabled={post.status !== 'pending'}
                                        />
                                    </td>
                                    <td
                                        onClick={() => {
                                            if (post.status === 'pending') {
                                                dispatch(openPreviewModal(post.id));
                                            }
                                        }}
                                        className={`p-3 text-sm font-medium text-center ${post.status === 'pending'
                                            ? 'text-blue-600 hover:underline cursor-pointer'
                                            : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {post.title}
                                    </td>

                                    <td className="p-3 text-sm text-gray-700 text-center">{post.author.username}</td>
                                    <td className="p-3 text-sm text-gray-700 text-center">{post.reportedReason}</td>
                                    <td className="p-3 text-sm text-gray-700 text-center">
                                        {post.reportedAt}
                                    </td>
                                    <td className="p-3 text-sm text-gray-700 text-center">
                                        {post.status === 'approved' && (
                                            <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-green-800 bg-green-200 rounded bg-opacity-50">
                                                Approved
                                            </span>
                                        )}
                                        {post.status === 'rejected' && (
                                            <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-red-800 bg-red-200 rounded bg-opacity-50">
                                                Rejected
                                            </span>
                                        )}
                                        {post.status === 'pending' && (
                                            <>
                                                <button
                                                    className="bg-green-100 text-green-700 px-2 py-1 mr-2 rounded hover:bg-green-200"
                                                    onClick={() => handleUpdateStatus(post.id, 'approved')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                                    onClick={() => dispatch(openRejectionModal(post.id))}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>

                                    {filterStatus === 'rejected' && (
                                        <td className="p-3 text-sm text-gray-600 text-center">
                                            {post.rejectionReason || <em className="text-gray-400">-</em>}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Batch actions */}
            {filterStatus === 'pending' && (
                <div className="mt-4 mb-5 flex justify-between items-center">
                    <div>Selected: {selected.length}</div>

                    <div className="flex gap-2">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            disabled={!selected.length}
                            onClick={() => handleBatchAction('approved')}
                        >
                            Approve Selected
                        </button>
                        <button
                            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            disabled={!selected.length}
                            onClick={() => handleBatchAction('rejected')}
                        >
                            Reject Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Rejection dialog box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Confirm Rejection</h2>
                        <textarea
                            placeholder="Optional: Enter rejection reason..."
                            value={reason}
                            onChange={(e) => dispatch(setRejectionReason(e.target.value))}
                            className="w-full border rounded p-2 mb-4 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => dispatch(closeRejectionModal())}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(updateStatus({ postId, status: 'rejected', reason }));
                                    dispatch(closeRejectionModal());

                                    // Show toast with Undo
                                    toast((t) => (
                                        <div className="text-sm">
                                            Post rejected.
                                            <button
                                                className="ml-2 text-blue-600 underline"
                                                onClick={() => {
                                                    dispatch(undoStatus(postId)); // This will revert status
                                                    toast.dismiss(t.id);
                                                }}
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    ), { duration: 5000 });

                                    // Clear undo history after 5s if not undone
                                    setTimeout(() => dispatch(clearRecentAction(postId)), 5000);
                                }}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className='flex justify-between' >
                <button
                    onClick={() => setShortcutDialogOpen(true)}
                    className="flex items-center gap-1.5 text-sm px-2 py-0.5 border rounded hover:bg-gray-100 leading-none"
                >
                    <Keyboard size={18} />
                    Shortcuts
                </button>

                {/* Pagination */}
                <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <KeyboardShortcutsDialog
                isOpen={isShortcutDialogOpen}
                onClose={() => setShortcutDialogOpen(false)}
            />
            <ContentPreviewModal />
        </div>
    );
}