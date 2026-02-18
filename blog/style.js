document.addEventListener('DOMContentLoaded', function() {
    var shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            var shareData = {
                title: document.title,
                url: window.location.href
            };
            if (navigator.share) {
                navigator.share(shareData)
                    .catch(function(error) {
                        console.log('Error sharing:', error);
                    })
                    .finally(function() {
                        shareButton.blur();
                    });
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(function() {
                        var notification = document.createElement('div');
                        notification.textContent = 'لینک کپی شد';
                        notification.style.position = 'fixed';
                        notification.style.bottom = '20px';
                        notification.style.left = '50%';
                        notification.style.transform = 'translateX(-50%)';
                        notification.style.backgroundColor = 'var(--color-accent)';
                        notification.style.color = '#fff';
                        notification.style.padding = '8px 16px';
                        notification.style.borderRadius = 'var(--radius-md)';
                        notification.style.zIndex = '1000';
                        notification.style.fontSize = 'var(--font-size-sm)';
                        notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                        document.body.appendChild(notification);
                        setTimeout(function() {
                            notification.remove();
                        }, 2000);
                    })
                    .catch(function() {
                        alert('اشتراک‌گذاری پشتیبانی نمی‌شود');
                    })
                    .finally(function() {
                        shareButton.blur();
                    });
            }
        });
    }

    (function() {
        const pageId = window.location.pathname;
        const commentsListEl = document.getElementById('comments-list');
        const form = document.getElementById('new-comment-form');
        const nameInput = document.getElementById('comment-name');
        const contentInput = document.getElementById('comment-content');
        const formMessage = document.getElementById('form-message');

        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        async function loadComments() {
            commentsListEl.innerHTML = '<p class="loading-text">در حال بارگیری نظرات...</p>';
            try {
                const response = await fetch(`/api/comments?page=${encodeURIComponent(pageId)}`);
                if (!response.ok) throw new Error('خطا در دریافت نظرات');
                const comments = await response.json();

                if (comments.length === 0) {
                    commentsListEl.innerHTML = '<p class="no-comments">هنوز دیدگاهی ثبت نشده است. شما اولین نفر باشید!</p>';
                    return;
                }

                let html = '';
                comments.forEach(comment => {
                    const date = new Date(comment.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    html += `
                        <div class="comment-item">
                            <div class="comment-header">
                                <span class="comment-name">${escapeHtml(comment.name)}</span>
                                <span class="comment-date">${date}</span>
                            </div>
                            <div class="comment-content">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                        </div>
                    `;
                });
                commentsListEl.innerHTML = html;
            } catch (err) {
                commentsListEl.innerHTML = '<p class="form-message" style="color: var(--color-accent);">خطا در بارگیری نظرات. لطفاً دوباره تلاش کنید.</p>';
                console.error(err);
            }
        }

        async function submitComment(event) {
            event.preventDefault();

            const name = nameInput.value.trim() || 'کاربر مهمان';
            const content = contentInput.value.trim();

            if (!content) {
                formMessage.textContent = 'لطفاً دیدگاه خود را وارد کنید.';
                formMessage.style.color = 'var(--color-accent)';
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'در حال ارسال...';

            try {
                const response = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pageId, name, content })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'خطا در ارسال نظر');
                }

                nameInput.value = '';
                contentInput.value = '';
                formMessage.textContent = 'دیدگاه شما با موفقیت ثبت شد و پس از تأیید نمایش داده خواهد شد.';
                formMessage.style.color = 'green';

                loadComments();
            } catch (err) {
                formMessage.textContent = err.message || 'خطا در ارسال نظر. لطفاً دوباره تلاش کنید.';
                formMessage.style.color = 'var(--color-accent)';
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ارسال دیدگاه';
            }
        }

        if (commentsListEl) {
            loadComments();
        }

        if (form) {
            form.addEventListener('submit', submitComment);
        }
    })();

    (function formatPostDate() {
        const dateElement = document.querySelector('.post-date');
        if (!dateElement) return;
        const dateStr = dateElement.dataset.date;
        if (!dateStr) return;
        const date = new Date(dateStr);
        const formatted = date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateElement.querySelector('.date-text').textContent = formatted;
    })();
});
