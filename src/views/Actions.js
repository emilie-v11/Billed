import eyeBlueIcon from '../assets/svg/eye_blue.js';
import downloadBlueIcon from '../assets/svg/download_blue.js';

export default billUrl => {
    return `<div class="icon-actions">
        <div data-testid="icon-eye" data-bill-url=${billUrl}>
        ${eyeBlueIcon}
        </div>
        <a href="${billUrl}" data-testid="icon-download" download target="_blank">
        ${downloadBlueIcon}
        </a>
    </div>`;
};
