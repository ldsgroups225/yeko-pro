// app/receipt/ReceiptDisplay.tsx

import type { ReceiptData } from './types'
import React from 'react'
import styles from './receipt.module.css'

interface ReceiptDisplayProps {
  data: ReceiptData
}

const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({ data }) => {
  return (
    <div className={styles.receipt} id="receipt-content">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.schoolName}>{data.schoolName}</div>
          <div>{data.schoolAddress}</div>
          <div>
            Tél:
            {data.schoolPhone}
          </div>
          <div>
            Code:
            {data.schoolCode}
          </div>
        </div>
        <div className={styles.headerCenter}>
          <h1 className={styles.receiptTitle}>Reçu de Paiement</h1>
          <div className={styles.receiptNumber}>
            N°
            {data.receiptNumber}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div>Année Scolaire</div>
          <div><strong>{data.academicYear}</strong></div>
          <div style={{ marginTop: '10px' }}>
            Date:
            {data.receiptDate}
          </div>
        </div>
      </header>

      <div className={styles.infoSection}>
        <div className={styles.sectionTitle}>Informations de l'Élève</div>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nom complet:</span>
              <span className={styles.infoValue}>{data.studentFullName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Matricule:</span>
              <span className={styles.infoValue}>{data.studentIdNumber}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sexe:</span>
              <span className={styles.infoValue}>{data.studentGender}</span>
            </div>
          </div>
          <div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date de naissance:</span>
              <span className={styles.infoValue}>{data.studentDateOfBirth}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Niveau:</span>
              <span className={styles.infoValue}>{data.gradeName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Adresse:</span>
              <span className={styles.infoValue}>{data.studentAddress}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <div className={styles.sectionTitle}>Détails du Paiement</div>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Description:</span>
              <span className={styles.infoValue}>{data.paymentDescription}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Méthode:</span>
              <span className={styles.infoValue}>{data.paymentMethod}</span>
            </div>
          </div>
          <div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date de paiement:</span>
              <span className={styles.infoValue}>{data.paymentDate}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Référence:</span>
              <span className={styles.infoValue}>{data.paymentReference}</span>
            </div>
          </div>
        </div>

        <div className={styles.paymentAmount}>
          Montant Payé:
          {' '}
          {data.paymentAmount.toLocaleString('fr-FR')}
          {' '}
          FCFA
        </div>

        {data.isStateAssigned && (
          <div className={styles.stateAssigned}>
            ✓ ÉLÈVE AFFECTÉ PAR L'ÉTAT
          </div>
        )}
      </div>

      <div className={styles.signatures}>
        <div className={styles.signatureBox}>
          <div className={styles.signatureLabel}>Signature du Payeur</div>
          <div className={styles.signatureSpace}></div>
        </div>
        <div className={styles.signatureBox}>
          <div className={styles.signatureLabel}>Cachet de l'École</div>
          <div className={styles.signatureSpace}></div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div>{data.footerText}</div>
        <div style={{ marginTop: '10px' }}>
          Ce reçu fait foi de paiement - Conservez-le précieusement
        </div>
      </footer>
    </div>
  )
}

export default ReceiptDisplay
