import { createSlice } from '@reduxjs/toolkit';

// Initial state for posts management
const initialState = {
    allPosts: [],
    selected: [],
    filterStatus: 'pending', // could be 'approved' | 'rejected'
    selectedTab: 'pending',  // currently active tab

    // Preview modal state
    previewModal: {
        isOpen: false,
        postId: null,
    },

    // Rejection modal state
    rejectionModal: {
        isOpen: false,
        postId: null,
        reason: '',
    },

    isLoading: true,

    // Stores the most recent action for undo functionality
    recentAction: null,
};




// Redux slice for post moderation
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // Set all posts (usually fetched from backend)
        setPosts: (state, action) => {
            state.allPosts = action.payload;
            state.isLoading = false;
        },

        // Set the currently selected tab
        setSelectedTab: (state, action) => {
            state.selectedTab = action.payload;
        },

        // Update status of a single post
        updateStatus: (state, action) => {
            const { postId, status, reason } = action.payload;
            const post = state.allPosts.find((p) => p.id === postId);
            if (post) {
                state.recentAction = [{ ...post }]; // store original post before update
                post.status = status;

                if (status === 'rejected') {
                    post.rejectionReason = reason || '-';
                }
            }
        },

        // Batch update status of multiple posts
        batchUpdateStatus: (state, action) => {
            const { ids, status } = action.payload;

            // Store current posts for undo
            state.recentAction = {
                type: 'batch',
                posts: state.allPosts
                    .filter(post => ids.includes(post.id))
                    .map(post => ({ ...post })) // clone each post
            };

            // Update statuses
            state.allPosts = state.allPosts.map(post =>
                ids.includes(post.id) ? { ...post, status } : post
            );
        },

        // Open preview modal for a given post
        openPreviewModal: (state, action) => {
            state.previewModal = { isOpen: true, postId: action.payload };
        },

        // Close the preview modal
        closePreviewModal: (state) => {
            state.previewModal = { isOpen: false, postId: null };
        },

        // Open rejection modal for a post
        openRejectionModal: (state, action) => {
            state.rejectionModal.isOpen = true;
            state.rejectionModal.postId = action.payload;
            state.rejectionModal.reason = '';
        },

        // Close rejection modal
        closeRejectionModal: (state) => {
            state.rejectionModal.isOpen = false;
            state.rejectionModal.postId = null;
            state.rejectionModal.reason = '';
        },

        // Set reason in rejection modal
        setRejectionReason: (state, action) => {
            state.rejectionModal.reason = action.payload;
        },

        // Set filtering status (used to filter post list)
        setFilterStatus: (state, action) => {
            state.filterStatus = action.payload;
        },

        // Set post to preview (doesn't open modal)
        setPreviewPost: (state, action) => {
            state.previewModal.postId = action.payload;
        },

        // Toggle selection of a single post
        toggleSelect: (state, action) => {
            const postId = action.payload;
            if (state.selected.includes(postId)) {
                state.selected = state.selected.filter((id) => id !== postId);
            } else {
                state.selected.push(postId);
            }
        },

        // Select or deselect all posts that are pending
        toggleSelectAll: (state) => {
            const selectable = state.allPosts
                .filter((p) => p.status === 'pending')
                .map((p) => p.id);

            if (state.selected.length === selectable.length) {
                state.selected = [];
            } else {
                state.selected = selectable;
            }
        },

        // Undo last status change
        undoStatus: (state) => {
            if (!state.recentAction) return;

            if (state.recentAction?.type === 'batch') {
                // Restore batch posts
                state.recentAction.posts.forEach(original => {
                    const index = state.allPosts.findIndex(p => p.id === original.id);
                    if (index !== -1) {
                        state.allPosts[index] = original;
                    }
                });
            } else {
                // Restore single post
                state.recentAction.forEach((originalPost) => {
                    const post = state.allPosts.find((p) => p.id === originalPost.id);
                    if (post) {
                        post.status = originalPost.status;
                    }
                });
            }

            state.recentAction = null;
        },

        // Clear recentAction state (e.g., after undo timeout)
        clearRecentAction: (state) => {
            state.recentAction = null;
        },
    }
});

export const {
    setPosts,
    toggleSelect,
    toggleSelectAll,
    setSelectedTab,
    updateStatus,
    batchUpdateStatus,
    openRejectionModal,
    closeRejectionModal,
    setRejectionReason,
    setFilterStatus,
    undoStatus,
    clearRecentAction,
    openPreviewModal,
    setPreviewPost,
    closePreviewModal,
} = postsSlice.actions;

export default postsSlice.reducer;