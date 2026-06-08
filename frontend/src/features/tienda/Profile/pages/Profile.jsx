/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React from 'react';
import { useProfile } from '../hooks/useProfile';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileDashboard from '../components/ProfileDashboard';
import PersonalInfo from '../components/PersonalInfo';
import OrdersSection from '../components/OrdersSection';
import ReturnsSection from '../components/ReturnsSection';
import { ImageModal, SuccessModal, ConfirmModal, PolicyModal, ExpiredReturnModal, WebcamModal } from '../components/ProfileModals';
import { CheckCircle } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const profile = useProfile();

  if (!profile.user) return null;

  return (
    <div className="gm-profile-page">
      <div className="gm-profile-layout">
        <ProfileSidebar 
          user={profile.user}
          isAdmin={profile.isAdmin}
          avatarUrl={profile.avatarUrl}
          getAvatarInitial={profile.getAvatarInitial}
          showAvatarMenu={profile.showAvatarMenu}
          setShowAvatarMenu={profile.setShowAvatarMenu}
          openFilePicker={profile.openFilePicker}
          onPickAvatar={profile.onPickAvatar}
          removeAvatar={profile.removeAvatar}
          fileInputRef={profile.fileInputRef}
          activeTab={profile.activeTab}
          setActiveTab={profile.setActiveTab}
          onLogout={profile.onLogout}
          setOrderView={profile.setOrderView}
          setReturnView={profile.setReturnView}
          setConfirmModal={profile.setConfirmModal}
          setShowWebcamModal={profile.setShowWebcamModal}
        />

        <main className="gm-profile-main">
          {profile.activeTab === 'account' && (
            <ProfileDashboard 
              allOrders={profile.allOrders}
              allReturns={profile.groupedReturns}
              formData={profile.formData}
              activeTab={profile.activeTab}
              setActiveTab={profile.setActiveTab}
              setSelectedOrder={profile.setSelectedOrder}
              setOrderView={profile.setOrderView}
              setSelectedReturn={profile.setSelectedReturn}
              setReturnView={profile.setReturnView}
            />
          )}

          {profile.activeTab === 'info' && (
            <PersonalInfo 
              isEditing={profile.isEditing}
              handleEditClick={profile.handleEditClick}
              handleSaveClick={profile.handleSaveClick}
              handleChange={profile.handleChange}
              formData={profile.formData}
              errors={profile.errors}
              setIsEditing={profile.setIsEditing}
              setConfirmModal={profile.setConfirmModal}
              showTopToast={profile.showTopToast}
              deactivateAccount={profile.deactivateAccount}
              deleteAccount={profile.deleteAccount}
            />
          )}

          {profile.activeTab === 'orders' && (
            <OrdersSection 
              orderView={profile.orderView}
              setOrderView={profile.setOrderView}
              orderStatus={profile.orderStatus}
              setOrderStatus={profile.setOrderStatus}
              orderQuery={profile.orderQuery}
              setOrderQuery={profile.setOrderQuery}
              paginatedOrders={profile.paginatedOrders}
              ordersPage={profile.ordersPage}
              setOrdersPage={profile.setOrdersPage}
              totalOrderPages={profile.totalOrderPages}
              selectedOrder={profile.selectedOrder}
              setSelectedOrder={profile.setSelectedOrder}
              openImage={profile.openImage}
              handleReturnClick={profile.handleReturnClick}
              setActiveTab={profile.setActiveTab}
              allReturns={profile.allReturns}
              user={profile.user}
              formData={profile.formData}
              handleBulkReturnClick={profile.handleBulkReturnClick}
              isBulkReturn={profile.isBulkReturn}
              handleMarkAsReceived={profile.handleMarkAsReceived}
              isReturnExpired={profile.isReturnExpired}
            />
          )}

          {profile.activeTab === 'returns' && (
            <ReturnsSection 
              returnView={profile.returnView}
              setReturnView={profile.setReturnView}
              returnStatus={profile.returnStatus}
              setReturnStatus={profile.setReturnStatus}
              returnQuery={profile.returnQuery}
              setReturnQuery={profile.setReturnQuery}
              paginatedReturns={profile.paginatedReturns}
              returnsPage={profile.returnsPage}
              setReturnsPage={profile.setReturnsPage}
              totalReturnPages={profile.totalReturnPages}
              selectedReturn={profile.selectedReturn}
              setSelectedReturn={profile.setSelectedReturn}
              handleReturnSubmit={profile.handleReturnSubmit}
              returnFormData={profile.returnFormData}
              setReturnFormData={profile.setReturnFormData}
              returnErrors={profile.returnErrors}
              selectedProduct={profile.selectedProduct}
              initialProducts={profile.initialProducts}
              getPriceNum={profile.getPriceNum}
              handleReturnImageUpload={profile.handleReturnImageUpload}
              formData={profile.formData}
              selectedOrder={profile.selectedOrder}
              isBulkReturn={profile.isBulkReturn}
              setActiveTab={profile.setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Modales */}
      {profile.showImageModal && (
        <ImageModal 
          src={profile.imageModalSrc} 
          onClose={() => profile.setShowImageModal(false)} 
        />
      )}

      {profile.showSuccessModal && (
        <SuccessModal 
          onClose={() => profile.setShowSuccessModal(false)} 
        />
      )}

      {profile.confirmModal.open && (
        <ConfirmModal 
          modal={profile.confirmModal} 
          onClose={() => profile.setConfirmModal(p => ({ ...p, open: false }))} 
        />
      )}

      {profile.showPolicyModal && (
        <PolicyModal 
          onClose={() => profile.setShowPolicyModal(false)} 
          onContinue={profile.handleContinueToReturn} 
        />
      )}

      {profile.showExpiredModal && (
        <ExpiredReturnModal 
          {...profile.expiredModalData}
          onClose={() => profile.setShowExpiredModal(false)} 
        />
      )}

      {profile.showWebcamModal && (
        <WebcamModal 
          onClose={() => profile.setShowWebcamModal(false)}
          onCapture={profile.handleWebcamCapture}
        />
      )}

      {profile.toast.open && (
        <div className="gm-toast-top">
          <CheckCircle size={18} color="#FFC107" />
          <span>{profile.toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default Profile;