const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const chooseButton = document.getElementById('chooseButton');

const previewBox = document.getElementById('previewBox');
const uploadTitle = document.getElementById('uploadTitle');

const convertButton = document.getElementById('convertButton');

let selectedFile = null;

// открыть окно выбора файла

chooseButton.onclick = () => {
	fileInput.click();
};

const formatSelector = document.getElementById('formatSelector');

const formatDropdown = document.getElementById('formatDropdown');

const selectedFormat = document.getElementById('selectedFormat');

let outputFormat = 'jpg';

// открыть меню

formatSelector.onclick = e => {
	formatSelector.classList.toggle('open');
};

// выбор формата

document.querySelectorAll('.format-dropdown div').forEach(item => {
	item.onclick = e => {
		e.stopPropagation();

		outputFormat = item.dataset.format;

		selectedFormat.innerHTML = item.innerHTML;

		formatSelector.classList.remove('open');

		console.log('Convert to:', outputFormat);
	};
});

// закрытие при клике вне

document.onclick = e => {
	if (!formatSelector.contains(e.target)) {
		formatSelector.classList.remove('open');
	}
};

// drag & drop

uploadZone.addEventListener('dragover', e => {
	e.preventDefault();

	uploadZone.classList.add('dragging');
});

uploadZone.addEventListener('dragleave', () => {
	uploadZone.classList.remove('dragging');
});

uploadZone.addEventListener('drop', e => {
	e.preventDefault();

	uploadZone.classList.remove('dragging');

	const file = e.dataTransfer.files[0];

	handleFile(file);
});

// выбор через input

fileInput.addEventListener('change', e => {
	const file = e.target.files[0];

	handleFile(file);
});

// проверка файла

function handleFile(file) {
	if (!file) {
		return;
	}

	if (!file.type.startsWith('image/')) {
		alert('Only images allowed!');

		return;
	}

	if (file.size > 20 * 1024 * 1024) {
		alert('Max size 20MB');

		return;
	}

	selectedFile = file;

	uploadTitle.innerHTML = file.name;

	showPreview(file);
}

// превью

function showPreview(file) {
	const reader = new FileReader();

	reader.onload = e => {
		previewBox.innerHTML = `

            <img 
                src="${e.target.result}"
                class="preview-image"
            >

            <p>
            ${(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

        `;
	};

	reader.readAsDataURL(file);
}

// отправка в Python

// отправка в Python

convertButton.onclick = async () => {
	if (!selectedFile) {
		alert('Choose image first');

		return;
	}

	convertButton.innerHTML = 'Converting...';

	const formData = new FormData();

	// картинка
	formData.append('image', selectedFile);

	// формат куда конвертировать
	formData.append('format', outputFormat);

	try {
		const response = await fetch('http://127.0.0.1:8000/convert', {
			method: 'POST',

			body: formData,
		});

		if (!response.ok) {
			throw new Error('Conversion failed');
		}

		const blob = await response.blob();

		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');

		link.href = url;

		link.download = `converted.${outputFormat}`;

		document.body.appendChild(link);

		link.click();

		link.remove();

		URL.revokeObjectURL(url);
	} catch (error) {
		console.log(error);

		alert('Server error');
	}

	convertButton.innerHTML = 'Convert image →';
};
