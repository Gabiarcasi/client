/**
 * Página: VendorsPage
 *
 * @description Este componente é a interface de gestão de fornecedores de um casamento.
 * Ele permite aos noivos visualizar os fornecedores agrupados por categoria,
 * adicionar novos contactos, editar os existentes, apagar e, o mais importante,
 * gerir o orçamento associado a cada fornecedor.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BudgetModal from '../components/BudgetModal';
import { formatPhoneNumber } from '../utils/formatters';
import '../css/VendorsPage.css';

// Componente auxiliar para o badge de status
const StatusBadge = ({ status }) => {
    let badgeClass = '';
    switch (status) {
        case 'Contratado': badgeClass = 'status_hired'; break;
        case 'Contactado': badgeClass = 'status_contacted'; break;
        case 'Recusado': badgeClass = 'status_rejected'; break;
        default: badgeClass = 'status_pending'; break;
    }
    return <span className={`status_badge ${badgeClass}`}>{status || 'Pendente'}</span>;
};

// Componente auxiliar para o botão do dropdown (três pontinhos)
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a href="" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }} className="button_action">
        {children}
    </a>
));

/**
 * @returns {JSX.Element} A página de gestão de fornecedores.
 */
export default function VendorsPage() {
    // Acessa o contexto do casamento para obter o casamento selecionado
    const { selectedWedding } = useWedding();
    
    // Estados para gerir a lista de fornecedores e o estado da interface
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para os modais de edição e de orçamento
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [formData, setFormData] = useState({});

    /**
     * Função memoizada para buscar os fornecedores.
     * `useCallback` evita que a função seja recriada em cada renderização.
     */
    const fetchVendors = useCallback(async () => {
        if (!selectedWedding) return;
        setLoading(true);
        try {
            const response = await api.get(`/vendors/wedding/${selectedWedding.wedding_id}`);
            setVendors(response.data);
        } catch (err) { setError('Ops, não conseguimos carregar os fornecedores.'); }
        finally { setLoading(false); }
    }, [selectedWedding]);

    /**
     * Hook useEffect: Chama `fetchVendors` quando o componente é montado ou `selectedWedding` muda.
     */
    useEffect(() => { fetchVendors(); }, [fetchVendors]);

    /**
     * Hook useMemo: Agrupa os fornecedores por categoria para uma renderização otimizada.
     * Evita recalcular o agrupamento em cada renderização, apenas se a lista `vendors` mudar.
     */
    const vendorsByCategory = useMemo(() => {
        return vendors.reduce((acc, vendor) => {
            const category = vendor.category || 'Outros';
            if (!acc[category]) { acc[category] = []; }
            acc[category].push(vendor);
            return acc;
        }, {});
    }, [vendors]);

    // Funções de gestão dos modais
    const handleOpenEditModal = (vendor = null) => {
        setError('');
        if (vendor) {
            setIsEditMode(true);
            setSelectedVendor(vendor);
            setFormData(vendor);
        } else {
            setIsEditMode(false);
            setSelectedVendor(null);
            setFormData({ status: 'Pendente', category: 'Outro' });
        }
        setIsEditModalOpen(true);
    };
    
    const handleOpenAddItemModal = (vendor) => {
        setSelectedVendor(vendor);
        setIsAddItemModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Usa a função de formatação para o número de telefone
            setFormData({ ...formData, [name]: formatPhoneNumber(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    /**
     * Lida com a submissão do formulário de contacto, para adicionar ou editar um fornecedor.
     */
    const handleContactFormSubmit = async (e) => {
        e.preventDefault();
        // Alterna entre a chamada de API de PUT (edição) e POST (adição)
        const apiCall = isEditMode ? api.put(`/vendors/${selectedVendor.vendor_id}`, formData) : api.post(`/vendors/wedding/${selectedWedding.wedding_id}`, formData);
        try {
            await apiCall;
            fetchVendors(); // Atualiza a lista após o sucesso
            setIsEditModalOpen(false);
        } catch (err) { setError(err.response?.data?.error || 'Ocorreu um erro ao salvar o fornecedor.'); }
    };

    /**
     * Lida com a exclusão de um fornecedor.
     */
    const handleDelete = async (vendorId) => {
        if (window.confirm('Tem a certeza que quer apagar este fornecedor? As despesas associadas NÃO serão apagadas do orçamento.')) {
            try {
                await api.delete(`/vendors/${vendorId}`);
                fetchVendors(); // Atualiza a lista após a exclusão
            } catch (err) { setError('Não foi possível apagar o fornecedor.'); }
        }
    };

    /**
     * Função para salvar um novo item de orçamento, passada como prop para o BudgetModal.
     */
    const handleSaveBudgetItem = (formData, weddingId) => {
        const dataToSave = { ...formData, status: formData.status || 'Orçamento' };
        return api.post(`/budget/wedding/${weddingId}`, dataToSave).then(() => fetchVendors());
    };

    // Renderização condicional para o estado de carregamento
    if (loading) return <LoadingSpinner />;

    return (
        <div className="container-fluid">
            {/* Cabeçalho da página com botão de adicionar */}
            <Row className="align-items-center mb-4">
                <Col xs={9}>
                    <h1 className="title_h1">Fornecedores</h1>
                    <p className="subtitle_main mb-0">Gira os seus contactos e as finanças de cada serviço contratado.</p>
                </Col>
                <Col xs={3} className="text-end">
                    <button className="button_primary" onClick={() => handleOpenEditModal()}>
                        <i className="bi bi-plus-lg me-2"></i>Adicionar Fornecedor
                    </button>
                </Col>
            </Row>

            <ErrorMessage>{error}</ErrorMessage>

            {/* Renderização condicional da lista de fornecedores */}
            {Object.keys(vendorsByCategory).length > 0 ? (
                // Mapeia sobre as categorias e depois sobre os fornecedores de cada categoria
                Object.keys(vendorsByCategory).sort().map(category => (
                    <div key={category} className="vendor_category_group">
                        <h2 className="category_title">{category}</h2>
                        <Row className="g-4">
                            {vendorsByCategory[category].map(vendor => {
                                // Cálculos para a barra de progresso do orçamento
                                const totalContracted = parseFloat(vendor.total_contracted || 0);
                                const totalPaid = parseFloat(vendor.total_paid || 0);
                                const progress = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;
                                return (
                                    <Col key={vendor.vendor_id} md={6} lg={4}>
                                        <div className="vendor_card_new">
                                            <div className="card_header">
                                                <div className="card_header_info">
                                                    <h3 className="vendor_name">{vendor.vendor_name}</h3>
                                                    <p className="vendor_meta">
                                                        <StatusBadge status={vendor.status} />
                                                    </p>
                                                </div>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle as={CustomToggle}>
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => handleOpenEditModal(vendor)}>Editar Contacto</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleDelete(vendor.vendor_id)} className="text-danger">Apagar Fornecedor</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            <div className="card_body">
                                                {/* Resumo financeiro com barra de progresso */}
                                                <div className="finance_summary">
                                                    <div className="finance_summary_labels">
                                                        <span>Pago</span>
                                                        <span>Total Contratado</span>
                                                    </div>
                                                    <div className="progress_bar_container">
                                                        <div className="progress_bar_fill" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                    <div className="finance_summary_labels mt-1">
                                                        <strong>R${totalPaid.toFixed(2)}</strong>
                                                        <small>R${totalContracted.toFixed(2)}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card_footer">
                                                <Button variant="outline-secondary" size="sm" onClick={() => handleOpenAddItemModal(vendor)}>Adicionar Orçamento</Button>
                                                <Link to={`/dashboard/budget?vendor=${vendor.vendor_id}`} className="btn btn-primary btn-sm button_primary">Ver Detalhes</Link>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                ))
            ) : (
                <div className="text-center mt-5"><p className="text-muted">Ainda não há fornecedores. Adicione o seu primeiro.</p></div>
            )}

            {/* Modal para Adicionar/Editar Fornecedor*/}
            <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)} centered>
                <Form onSubmit={handleContactFormSubmit}>
                    <Modal.Header closeButton><Modal.Title>{isEditMode ? 'Editar Fornecedor' : 'Novo Fornecedor'}</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <ErrorMessage>{error}</ErrorMessage>
                        <Row>
                            <Col md={7}><Form.Group className="mb-3"><Form.Label className="form_label">Nome do Fornecedor</Form.Label><Form.Control type="text" name="vendor_name" value={formData.vendor_name || ''} onChange={handleFormChange} required /></Form.Group></Col>
                            <Col md={5}><Form.Group className="mb-3"><Form.Label className="form_label">Categoria</Form.Label><Form.Select name="category" value={formData.category || ''} onChange={handleFormChange} required>
                                <option value="Espaço">Espaço / Local</option>
                                <option value="Buffet">Buffet / Catering</option>
                                <option value="Decoração">Decoração / Flores</option>
                                <option value="Fotografia">Fotografia</option>
                                <option value="Vídeo">Vídeo / Filmagem</option>
                                <option value="Música">Música / DJ / Banda</option>
                                <option value="Trajes">Trajes (Noiva e Noivo)</option>
                                <option value="Beleza">Beleza (Cabelo e Maquilhagem)</option>
                                <option value="Convites">Convites e Papelaria</option>
                                <option value="Bolo">Bolo e Doces</option>
                                <option value="Lembrancinhas">Lembrancinhas</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Cerimonialista">Cerimonialista / Assessoria</option>
                                <option value="Lua de Mel">Lua de Mel</option>
                                <option value="Outro">Outro</option>
                            </Form.Select>
                            </Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-3"><Form.Label className="form_label">Status</Form.Label><Form.Select name="status" value={formData.status || ''} onChange={handleFormChange}><option>Pendente</option><option>Contactado</option><option>Contratado</option><option>Recusado</option></Form.Select></Form.Group>
                        <hr />
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="form_label">Nome do Contacto</Form.Label><Form.Control type="text" name="contact_name" value={formData.contact_name || ''} onChange={handleFormChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="form_label">Telefone</Form.Label><Form.Control type="tel" name="phone" value={formData.phone || ''} onChange={handleFormChange} /></Form.Group></Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="button_secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="button_primary">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            {/* Modal para ADICIONAR um novo item de orçamento */}
            {selectedVendor && <BudgetModal show={isAddItemModalOpen} onHide={() => setIsAddItemModalOpen(false)} onSave={handleSaveBudgetItem} weddingId={selectedWedding.wedding_id} initialData={{ vendor_id: selectedVendor.vendor_id, category: selectedVendor.category }} />}
        </div>
    );
}