export const buildHref = (key: string, value: string) => {
    const checkUrl = (url: string, domain?: string) => {
        let v = url.trim();

        // trim trailing slashes
        v = v.replace(/\/+$/, "");

        // already a URL? keep it
        if (/^[a-z]+:\/\//i.test(v)) return v;
        // missing scheme but clearly a `domain` URL
        const re = new RegExp(`^(?:https?:\\/\\/)?(?:www\\.)?${domain || "([a-z0-9.-]+)"}`, "i");
        if (re.test(v)) return `https://${v.replace(/^www\./i, "")}`;
        // handle @username or username[/repo]
        return `https://${domain}/${v.replace(/^@/, "")}`;
    };

    switch (key) {
        case "email":
            return `mailto:${value.replace(/^mailto:/i, "").trim()}`;
        case "phone":
            return `tel:${value.replace(/^tel:/i, "").trim()}`;
        case "location":
            return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
        case "github":
            return checkUrl(value, "github.com");
        default:
            return checkUrl(value); // website, linkedin, or anything else
    }
};
