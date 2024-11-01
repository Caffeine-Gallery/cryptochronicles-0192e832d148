import { backend } from "declarations/backend";

let quill;
const modal = document.getElementById('modal');
const postForm = document.getElementById('postForm');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');
const postsContainer = document.getElementById('posts');
const loadingElement = document.getElementById('loading');

// Initialize Quill editor
function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// Format timestamp
function formatDate(timestamp) {
    const date = new Date(Number(timestamp) / 1000000); // Convert nano to milliseconds
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load and display posts
async function loadPosts() {
    try {
        loadingElement.style.display = 'block';
        const posts = await backend.getPosts();
        loadingElement.style.display = 'none';
        
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">By ${post.author}</span>
                    <span class="date">${formatDate(post.timestamp)}</span>
                </div>
                <div class="post-content">${post.body}</div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        loadingElement.textContent = 'Error loading posts. Please try again later.';
    }
}

// Event Listeners
newPostBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    initQuill();
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    try {
        const submitButton = postForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Publishing...';

        await backend.createPost(title, content, author);
        
        // Reset form
        postForm.reset();
        quill.setContents([]);
        modal.style.display = 'none';
        
        // Reload posts
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Publish';
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initial load
loadPosts();
