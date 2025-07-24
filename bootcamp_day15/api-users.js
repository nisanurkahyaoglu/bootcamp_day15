(() => {
    const startApp = ($) => {
        const appendLocation = $('<div>', { class: 'ins-api-users' }).css({
            padding: "20px",
            backgroundColor: "#9b6464",
            border: "2px solid #ccc",
            maxWidth: "800px",
            margin: "30px auto",
            fontFamily: "Arial, sans-serif"
        });

        if (!$('.ins-api-users').length) {
            $('body').append(appendLocation);
        }

        const reloadBtnId = 'reload-button';
        let users = [];
        let observerActive = false;

        const createReloadBtn = () => {
            if (sessionStorage.getItem("reloadUsed") === "true") return null;

            const btn = $('<button>Verileri Yeniden Yükle</button>').css({
                display: "block",
                margin: "20px auto 0",
                padding: "10px 20px",
                backgroundColor: "#a00",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
            }).attr("id", reloadBtnId);

            btn.on("click", () => {
                getAndRender();
                sessionStorage.setItem("reloadUsed", "true");
                btn.remove();
            });

            return btn;
        };

        const updateReloadBtn = () => {
            if (!observerActive) return;

            const cards = appendLocation.find('.user-card');
            const hasBtn = appendLocation.find(`#${reloadBtnId}`).length > 0;

            switch (true) {
                case cards.length === 0 && !hasBtn && sessionStorage.getItem("reloadUsed") !== "true":
                    const btn = createReloadBtn();
                    if (btn) appendLocation.append(btn);
                    break;

                case cards.length > 0 && hasBtn:
                    appendLocation.find(`#${reloadBtnId}`).remove();
                    break;
            }
        };

        const renderUsers = (data) => {
            users = data;
            appendLocation.empty();

            if (users.length === 0) {
                updateReloadBtn();
                return;
            }

            users.forEach(user => {
                const card = $('<div>').addClass('user-card').css({
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                });

                card.append(`<h3>${user.name}</h3>`);
                card.append(`<p><strong>Email:</strong> ${user.email}</p>`);
                card.append(`<p><strong>Adres:</strong> ${user.address.street}, ${user.address.city}</p>`);

                const deleteBtn = $('<button>Sil</button>').css({
                    marginTop: "5px",
                    backgroundColor: "#ff1900",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer"
                });

                deleteBtn.on("click", () => {
                    users = users.filter(u => u.id !== user.id);
                    localStorage.setItem("usersData", JSON.stringify(users));
                    renderUsers(users);
                });

                card.append(deleteBtn);
                appendLocation.append(card);
            });

            observerActive = true;
            updateReloadBtn();
        };

        const getAndRender = () => {
            $.getJSON("https://jsonplaceholder.typicode.com/users")
                .done(data => {
                    users = data;
                    localStorage.setItem("usersData", JSON.stringify(data));
                    localStorage.setItem("usersDataTime", Date.now());
                    renderUsers(data);
                })
                .fail(() => {
                    appendLocation.html('<p style="color:red;">API Hatası!</p>');
                    users = [];
                    observerActive = true;
                    updateReloadBtn();
                });
        };

        const observer = new MutationObserver(() => {
            updateReloadBtn();
        });

        observer.observe(appendLocation[0], {
            childList: true
        });

        const cachedUsers = JSON.parse(localStorage.getItem("usersData"));
        const cachedTime = localStorage.getItem("usersDataTime");
        const isExpired = !cachedTime || (Date.now() - cachedTime > 24 * 60 * 60 * 1000);

        if (cachedUsers && !isExpired) {
            users = cachedUsers;
            renderUsers(users);
        } else {
            getAndRender();
        }
    };

    if (typeof jQuery === "undefined") {
        const script = document.createElement("script");
        script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        script.onload = () => startApp(window.jQuery);
        document.head.appendChild(script);
    } else {
        startApp(window.jQuery);
    }
})();