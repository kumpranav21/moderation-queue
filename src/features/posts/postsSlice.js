import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allPosts: [],
    selected: [],
    filterStatus: 'pending', // 'approved' | 'rejected'
    rejectionModal: { isOpen: false, postId: null, reason: '' },
    previewModal: {
        isOpen: false,
        postId: null,
    },
    isLoading: true,
    recentAction: null,
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.allPosts = action.payload;
            state.isLoading = false;
        },
        updateStatus: (state, action) => {
            const { postId, status, reason } = action.payload;
            const post = state.allPosts.find((p) => p.id === postId);
            if (post) {
                state.recentAction = [{ ...post }]; // store original
                post.status = status;
                if (status === 'rejected') {
                    post.rejectionReason = reason || '-';
                }
            }
        },
        batchUpdateStatus: (state, action) => {
            const { ids, status } = action.payload;
            const updatedPosts = [];

            state.allPosts.forEach((post) => {
                if (ids.includes(post.id)) {
                    updatedPosts.push({ ...post }); // store original
                    post.status = status;
                }
            });

            state.recentAction = updatedPosts;
        },
        openPreviewModal: (state, action) => {
            state.previewModal = { isOpen: true, postId: action.payload };
        },
        closePreviewModal: (state) => {
            state.previewModal = { isOpen: false, postId: null };
        },
        undoStatus: (state) => {
            if (!state.recentAction) return;

            if (state.recentAction?.type === 'batch') {
                state.recentAction.posts.forEach(original => {
                    const index = state.allPosts.findIndex(p => p.id === original.id);
                    if (index !== -1) {
                        state.allPosts[index] = original;
                    }
                });
            } else {
                state.recentAction.forEach((originalPost) => {
                    const post = state.allPosts.find((p) => p.id === originalPost.id);
                    if (post) {
                        post.status = originalPost.status;
                    }
                });
            }

            state.recentAction = null;
        },



        clearRecentAction: (state) => {
            state.recentAction = null;
        },
        toggleSelect: (state, action) => {
            const postId = action.payload;
            if (state.selected.includes(postId)) {
                state.selected = state.selected.filter((id) => id !== postId);
            } else {
                state.selected.push(postId);
            }
        },
        toggleSelectAll: (state) => {
            const selectable = state.allPosts.filter((p) => p.status === 'pending').map((p) => p.id);
            if (state.selected.length === selectable.length) {
                state.selected = [];
            } else {
                state.selected = selectable;
            }
        },
        batchUpdateStatus: (state, action) => {
            const { ids, status } = action.payload;

            // Store current state for undo
            state.recentAction = {
                type: 'batch',
                posts: state.allPosts
                    .filter(post => ids.includes(post.id))
                    .map(post => ({ ...post })) // clone posts
            };

            // Apply status update
            state.allPosts = state.allPosts.map(post =>
                ids.includes(post.id) ? { ...post, status } : post
            );
        },
        openRejectionModal: (state, action) => {
            state.rejectionModal.isOpen = true;
            state.rejectionModal.postId = action.payload;
            state.rejectionModal.reason = '';
        },
        closeRejectionModal: (state) => {
            state.rejectionModal.isOpen = false;
            state.rejectionModal.postId = null;
            state.rejectionModal.reason = '';
        },
        setRejectionReason: (state, action) => {
            state.rejectionModal.reason = action.payload;
        },
        setFilterStatus: (state, action) => {
            state.filterStatus = action.payload;
        },
    }
});


export const {
    setPosts,
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
} = postsSlice.actions;

export default postsSlice.reducer;