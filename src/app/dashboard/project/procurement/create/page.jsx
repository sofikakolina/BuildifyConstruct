'use client'
import { useAppSelector } from '@/lib/hooks';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ProcurementStatus } from '@prisma/client';
import { TextField } from '@mui/material';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
const translateStatus = (status) => {
  const statusTranslations = {
    [ProcurementStatus.Initial]: 'Начальный',
    [ProcurementStatus.InWork]: 'В работе',
    [ProcurementStatus.Check]: 'На проверке',
    [ProcurementStatus.ForCorrection]: 'На исправлении',
    [ProcurementStatus.Complete]: 'Завершен',
    [ProcurementStatus.Cancelled]: 'Отменен'
  };
  return statusTranslations[status] || status;
};

const ProcurementsCreate = () => {
    const router = useRouter()
    const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);
    const [procurement, setProcurement] = useState({
        name: "",
        description: "",
        details: "",
        status: ProcurementStatus.Initial,
        projectId: idCurrentProject,
        assignedStaff: [],
        documents: [],
        designDocuments: [],
        procurementDocumentation: [],
        deliveryDocumentation: [],
    });

    const [staff, setStaff] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);
    const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
    const [showDesignDocsDropdown, setShowDesignDocsDropdown] = useState(false);
    const [showProcurementDocsDropdown, setShowProcurementDocsDropdown] = useState(false);
    const [showDeliveryDocsDropdown, setShowDeliveryDocsDropdown] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [file, setFile] = useState(null);
    const [nameFile, setNameFile] = useState('');
    const [titleFile, setTitleFile] = useState('');

    // Refs для обработки кликов вне области
    const staffDropdownRef = useRef(null);
    const documentsDropdownRef = useRef(null);
    const designDocsDropdownRef = useRef(null);
    const procurementDocsDropdownRef = useRef(null);
    const deliveryDocsDropdownRef = useRef(null);
    const uploadFormRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const [staffRes, documentsRes] = await Promise.all([
                axios.get('/api/dashboard/projects/team', {
                    params: { projectId: idCurrentProject }
                }),
                axios.get('/api/dashboard/projects/tasks/documents', {
                    params: { projectId: idCurrentProject }
                }),
            ]);
            setStaff(staffRes.data);
            setDocuments(documentsRes.data.documents);
        };

        fetchData();
    }, [idCurrentProject]);

    // Обработчик кликов вне области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target)) {
                setShowStaffDropdown(false);
            }
            if (documentsDropdownRef.current && !documentsDropdownRef.current.contains(event.target)) {
                setShowDocumentsDropdown(false);
            }
            if (designDocsDropdownRef.current && !designDocsDropdownRef.current.contains(event.target)) {
                setShowDesignDocsDropdown(false);
            }
            if (procurementDocsDropdownRef.current && !procurementDocsDropdownRef.current.contains(event.target)) {
                setShowProcurementDocsDropdown(false);
            }
            if (deliveryDocsDropdownRef.current && !deliveryDocsDropdownRef.current.contains(event.target)) {
                setShowDeliveryDocsDropdown(false);
            }
            if (uploadFormRef.current && !uploadFormRef.current.contains(event.target)) {
                setShowUploadForm(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProcurement(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e) => {
        setProcurement(prev => ({ ...prev, status: e.target.value }));
    };

    const toggleStaffSelection = (staffId) => {
        setProcurement(prev => {
            const currentAssigned = [...prev.assignedStaff];
            const index = currentAssigned.indexOf(staffId);
            
            if (index === -1) {
                currentAssigned.push(staffId);
            } else {
                currentAssigned.splice(index, 1);
            }
            
            return { ...prev, assignedStaff: currentAssigned };
        });
    };

    const toggleDocumentSelection = (docId, field) => {
        setProcurement(prev => {
            const currentDocs = [...prev[field]];
            const index = currentDocs.indexOf(docId);
            
            if (index === -1) {
                currentDocs.push(docId);
            } else {
                currentDocs.splice(index, 1);
            }
            
            return { ...prev, [field]: currentDocs };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/dashboard/projects/procurements', procurement);
            console.log('Закупка создана:', response.data);
            toast.success('Закупка успешно создана!');
            router.push("/dashboard/project/procurement")
        } catch (error) {
            console.error('Ошибка при создании закупки:', error);
            toast.error('Ошибка при создании закупки');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFile(file);
    };

    const handleDocumentUpload = async () => {
        if (!file) {
            toast.error('Пожалуйста, выберите файл');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", idCurrentProject);
        formData.append("name", nameFile);
        formData.append("title", titleFile);

        try {
            const response = await axios.post("/api/dashboard/projects/tasks/documents", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                const docsResponse = await axios.get('/api/dashboard/projects/tasks/documents', {
                    params: { projectId: idCurrentProject }
                });
                setDocuments(docsResponse.data.documents);
                setNameFile('');
                setTitleFile('');
                setFile(null);
                setShowUploadForm(false);
                toast.success("Документ успешно загружен!");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error || "Не удалось загрузить документ");
            } else {
                toast.error("Произошла неизвестная ошибка");
            }
        }
    };

    const buyers = staff.filter(user => user.role === 'Buyer');

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Создание новой закупки</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Основные поля формы */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название закупки*</label>
                        <input
                            type="text"
                            name="name"
                            value={procurement.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                            placeholder="Введите название закупки"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                        <select
                            value={procurement.status}
                            onChange={handleStatusChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            {Object.values(ProcurementStatus).map(status => (
                                <option key={status} value={status}>
                                    {translateStatus(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
                        name="description"
                        value={procurement.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows={3}
                        placeholder="Краткое описание закупки"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Детали</label>
                    <textarea
                        name="details"
                        value={procurement.details}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows={5}
                        placeholder="Подробное описание закупки, требования, спецификации"
                    />
                </div>

                {/* Блок загрузки документов */}
                <div ref={uploadFormRef}>
                    <button
                        type="button"
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="flex items-center gap-2 text-gold hover:text-blue-800 mb-4"
                    >
                        {showUploadForm ? (
                            <>
                                <IoIosArrowUp /> Скрыть форму загрузки
                            </>
                        ) : (
                            <>
                                <IoIosArrowDown /> Загрузить новый документ
                            </>
                        )}
                    </button>

                    {showUploadForm && (
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Загрузка нового документа</h3>
                            
                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors duration-200 mb-4">
                                <div className="flex flex-col items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-10 h-10 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                        />
                                    </svg>
                                    <p className="text-gray-600 text-sm">
                                        Перетащите файл сюда или
                                    </p>
                                </div>
                
                                <label className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-2 rounded-lg text-white transition-colors duration-200 cursor-pointer">
                                    Выбрать файл
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                
                                {file && (
                                    <p className="mt-2 text-gray-700 text-sm">
                                        Выбран файл: <span className="font-medium">{file.name}</span>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <TextField
                                    label="Название документа"
                                    variant="outlined"
                                    fullWidth
                                    value={nameFile}
                                    onChange={(e) => setNameFile(e.target.value)}
                                />
                                <TextField
                                    label="Описание документа"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={titleFile}
                                    onChange={(e) => setTitleFile(e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleDocumentUpload}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors"
                            >
                                Сохранить документ
                            </button>
                        </div>
                    )}
                </div>

                {/* Выбор документов */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[
                        {
                            title: "Основные документы",
                            field: "documents",
                            show: showDocumentsDropdown,
                            setShow: setShowDocumentsDropdown,
                            ref: documentsDropdownRef
                        },
                        {
                            title: "Проектные документы",
                            field: "designDocuments",
                            show: showDesignDocsDropdown,
                            setShow: setShowDesignDocsDropdown,
                            ref: designDocsDropdownRef
                        },
                        {
                            title: "Документация закупки",
                            field: "procurementDocumentation",
                            show: showProcurementDocsDropdown,
                            setShow: setShowProcurementDocsDropdown,
                            ref: procurementDocsDropdownRef
                        },
                        {
                            title: "Документы поставки",
                            field: "deliveryDocumentation",
                            show: showDeliveryDocsDropdown,
                            setShow: setShowDeliveryDocsDropdown,
                            ref: deliveryDocsDropdownRef
                        }
                    ].map(({ title, field, show, setShow, ref }) => (
                        <div key={field} className="relative" ref={ref}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{title}</label>
                            <div 
                                className="mt-1 flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => setShow(!show)}
                            >
                                <span className="text-gray-700">
                                    {procurement[field].length > 0 
                                        ? `Выбрано: ${procurement[field].length}` 
                                        : "Выберите документы"}
                                </span>
                                {show ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </div>
                            
                            {show && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {documents.length > 0 ? (
                                        documents.map(doc => (
                                            <div key={doc.id} className="p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={procurement[field].includes(doc.id)}
                                                        onChange={() => toggleDocumentSelection(doc.id, field)}
                                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-800">{doc.name || doc.filename}</p>
                                                        {doc.title && <p className="text-xs text-gray-600 mt-1">{doc.title}</p>}
                                                        {doc.description && <p className="text-xs text-gray-500 mt-1">{doc.description}</p>}
                                                    </div>
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-gray-500 text-center">Нет доступных документов</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Ответственные сотрудники */}
                <div className="relative" ref={staffDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ответственные сотрудники</label>
                    <div 
                        className="mt-1 flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                    >
                        <span className="text-gray-700">
                            {procurement.assignedStaff.length > 0 
                                ? `Выбрано: ${procurement.assignedStaff.length}` 
                                : "Выберите сотрудников"}
                        </span>
                        {showStaffDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </div>
                    
                    {showStaffDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {buyers.length > 0 ? (
                                buyers.map(staff => (
                                    <div key={staff.id} className="p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={procurement.assignedStaff.includes(staff.id)}
                                                onChange={() => toggleStaffSelection(staff.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{staff.name}</p>
                                                <p className="text-xs text-gray-500">{staff.email}</p>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-gray-500 text-center">Нет доступных закупщиков</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-lg font-medium rounded-lg text-white bg-gold hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors"
                    >
                        Создать закупку
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProcurementsCreate;