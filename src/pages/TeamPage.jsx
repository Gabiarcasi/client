/**
 * Página: TeamPage
 *
 * @description Este componente React é responsável por gerir a equipa de planeamento de um casamento.
 * Ele permite aos noivos visualizar os membros existentes, convidar novos membros através de um modal,
 * editar permissões e gerir convites pendentes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Form, Button, Row, Col, Modal, Dropdown, Alert } from 'react-bootstrap';

const CustomPermissionToggle = React.forwardRef(({ children, onClick }, ref) => (
	<a href="" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }} className="custom_status_toggle">{children}</a>
));

export default function TeamPage() {
    const { selectedWedding } = useWedding();
    
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para o modal de convite
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [permissionLevel, setPermissionLevel] = useState('view');
    const [relationship, setRelationship] = useState('Cerimonialista');

    const fetchData = useCallback(async () => {
        if (!selectedWedding) return;
        setLoading(true);
        try {
            const [membersRes, invitesRes] = await Promise.all([
                api.get(`/team/wedding/${selectedWedding.wedding_id}`),
                api.get(`/team/invitations/${selectedWedding.wedding_id}`)
            ]);
            setTeamMembers(membersRes.data);
            setPendingInvitations(invitesRes.data);
        } catch (err) {
            setError('Não foi possível carregar os dados da equipe.');
        } finally {
            setLoading(false);
        }
    }, [selectedWedding]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await api.post('/team/invite', {
                weddingId: selectedWedding.wedding_id,
                email: inviteEmail,
                permissionLevel,
                relationship,
            });
            setSuccess(response.data.message);
            setInviteEmail('');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Ocorreu um erro ao enviar o convite.');
        }
    };

    const handlePermissionChange = async (member, newPermission) => {
        try {
            await api.patch('/team/member', {
                weddingId: selectedWedding.wedding_id,
                memberUserId: member.user_id,
                permissionLevel: newPermission
            });
            fetchData(); // Recarrega os dados para confirmar a alteração
        } catch (err) {
            setError(err.response?.data?.error || 'Não foi possível alterar a permissão.');
        }
    };

    const handleCancelInvitation = async (invitationId) => {
        if (window.confirm('Tem a certeza que quer cancelar este convite?')) {
            try {
                await api.delete(`/team/invitation/${invitationId}`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.error || 'Não foi possível cancelar o convite.');
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container-fluid">
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="title_h1">Equipa de Planeamento</h1>
                    <p className="subtitle_main mb-0">Convide e gira quem pode aceder e editar o planeamento do seu casamento.</p>
                </Col>
                <Col className="text-end">
                    <Button className="button_primary" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Adicionar Membro
                    </Button>
                </Col>
            </Row>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="form_card mb-4">
                <h2 className="form_card_title">Membros Atuais</h2>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Relação</th>
                                <th>Permissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map(member => (
                                <tr key={member.user_id}>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.relationship}</td>
                                    <td>
                                        <Dropdown onSelect={(eventKey) => handlePermissionChange(member, eventKey)}>
                                            <Dropdown.Toggle as={CustomPermissionToggle}>
                                                <span className={`badge ${member.permission_level === 'edit' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {member.permission_level === 'edit' ? 'Pode Editar' : 'Apenas Ver'}
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item eventKey="edit">Pode Editar</Dropdown.Item>
                                                <Dropdown.Item eventKey="view">Apenas Ver</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pendingInvitations.length > 0 && (
                <div className="form_card">
                    <h2 className="form_card_title">Convites Pendentes</h2>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Email Convidado</th>
                                    <th>Relação</th>
                                    <th>Permissão</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingInvitations.map(invite => (
                                    <tr key={invite.invitation_id}>
                                        <td>{invite.email}</td>
                                        <td>{invite.relationship}</td>
                                        <td>{invite.permission_level === 'edit' ? 'Pode Editar' : 'Apenas Ver'}</td>
                                        <td className="text-center">
                                            <button className="button_action text-danger" onClick={() => handleCancelInvitation(invite.invitation_id)} title="Cancelar Convite">
                                                <i className="bi bi-x-circle-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal para Convidar Novo Membro */}
            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Convidar Novo Membro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleInviteSubmit}>
                        <ErrorMessage>{error}</ErrorMessage>
                        <Form.Group className="mb-3">
                            <Form.Label className="form_label">Email do Convidado</Form.Label>
                            <Form.Control type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="form_label">Relação com o Casamento</Form.Label>
                            <Form.Select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                                <option>Cerimonialista</option>
                                <option>Noiva</option>
                                <option>Noivo</option>
                                <option>Mãe da Noiva</option>
                                <option>Pai da Noiva</option>
                                <option>Mãe do Noivo</option>
                                <option>Pai do Noivo</option>
                                <option>Padrinho / Madrinha</option>
                                <option>Irmão / Irmã</option>
                                <option>Amigo(a)</option>
                                <option>Outro</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="form_label">Nível de Permissão</Form.Label>
                            <Form.Select value={permissionLevel} onChange={(e) => setPermissionLevel(e.target.value)}>
                                <option value="view">Apenas Visualizar</option>
                                <option value="edit">Pode Editar</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="text-end mt-4">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="me-2">Cancelar</Button>
                            <Button type="submit" className="button_primary">Enviar Convite</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}