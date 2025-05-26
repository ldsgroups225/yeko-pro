// app/report-card/ReportCardDisplay.tsx

import type { ReportCardData } from './types'
import { nanoid } from 'nanoid'
import React from 'react'
import styles from './report.module.css'

interface ReportCardDisplayProps {
  data: ReportCardData
}

const ReportCardDisplay: React.FC<ReportCardDisplayProps> = ({ data }) => {
  return (
    <div className={styles.bulletin} id="bulletin-content">
      <header className="pageHeader">
        <div className={styles.headerLeft}>
          <p>{data.ministere}</p>
        </div>
        <div className={styles.headerCenter}>
          <h1>{data.bulletinTitle}</h1>
          <p>{data.term}</p>
        </div>
        <div className={styles.headerRight}>
          <p>Année Scolaire</p>
          <span>{data.schoolYear}</span>
        </div>
      </header>

      <div className={styles.schoolInfo}>
        <div className={styles.schoolInfoLeft}>
          <div className={styles.schoolLogo}></div>
          {' '}
          {/* Placeholder for logo if any */}
          <div className={styles.schoolDetails}>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Établissement :</div>
              <div className={`${styles.infoValue} ${styles.collegeName}`}>{data.schoolName}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Adresse Postale :</div>
              <div className={styles.infoValue}>{data.schoolAddress}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Téléphone :</div>
              <div className={styles.infoValue}>{data.schoolPhone}</div>
            </div>
          </div>
        </div>
        <div className={styles.schoolInfoRight}>
          <div className={styles.infoPair}>
            <div className={styles.infoLabel}>Code :</div>
            <div className={styles.infoValue}>{data.schoolCode}</div>
          </div>
          <div className={styles.infoPair}>
            <div className={styles.infoLabel}>Statut :</div>
            <div className={styles.infoValue}>{data.schoolStatus}</div>
          </div>
        </div>
      </div>

      <div className={styles.studentInfo}>
        <div className={styles.studentInfoLeft}>
          <div className={styles.studentInfoColumn}>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Élève :</div>
              <div className={`${styles.infoValue} ${styles.studentFullname}`}>{data.studentFullName}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Matricule :</div>
              <div className={styles.infoValue}>{data.studentMatricule}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Classe :</div>
              <div className={styles.infoValue}>{data.studentClass}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Effectif :</div>
              <div className={styles.infoValue}>{data.studentEffectif}</div>
            </div>
          </div>
          <div className={styles.studentInfoColumn}>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Sexe :</div>
              <div className={styles.infoValue}>{data.studentSex}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Né(e) le :</div>
              <div className={styles.infoValue}>{data.studentBirthDate}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Lieu :</div>
              <div className={styles.infoValue}>{data.studentBirthplace}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Nationalité :</div>
              <div className={styles.infoValue}>{data.studentNationality || ''}</div>
            </div>
          </div>
          <div className={styles.studentInfoColumn}>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Red :</div>
              <div className={styles.infoValue}>{data.studentRedoublement}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Régime :</div>
              <div className={styles.infoValue}>{data.studentRegime}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Statut :</div>
              <div className={styles.infoValue}>{data.studentStatut || ''}</div>
            </div>
            <div className={styles.infoPair}>
              <div className={styles.infoLabel}>Interne :</div>
              <div className={styles.infoValue}>{data.studentIntern || ''}</div>
            </div>
          </div>
        </div>
      </div>

      <table className={styles.gradesTable}>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>DISCIPLINE</th>
            <th>TRIM1</th>
            <th>RANG1</th>
            <th>TRIM2</th>
            <th>RANG2</th>
            <th>MG</th>
            <th>RANG</th>
            <th style={{ width: '15%' }}>PROFESSEUR</th>
            <th style={{ width: '15%' }}>APPRECIATION</th>
          </tr>
        </thead>
        <tbody>
          {data.grades.map(grade => (
            <tr key={nanoid()} className={grade.discipline.includes('BILAN') ? styles.bilanRow : ''}>
              <td className={`${styles.discipline} ${styles.truncate}`}>{grade.discipline}</td>
              <td className={styles.gradesTableCenter}>{grade.trim1 || ''}</td>
              <td className={styles.gradesTableCenter}>{grade.rang1 || ''}</td>
              <td className={styles.gradesTableCenter}>{grade.trim2 || ''}</td>
              <td className={styles.gradesTableCenter}>{grade.rang2 || ''}</td>
              <td className={styles.gradesTableCenter}>{grade.mg || ''}</td>
              <td className={styles.gradesTableCenter}>{grade.rang || ''}</td>
              <td className={styles.truncate}>{grade.teacher || ''}</td>
              <td className={styles.truncate}>{grade.evaluation || ''}</td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <td className={styles.discipline}>TOTAL</td>
            <td colSpan={4}></td>
            <td className={styles.gradesTableCenter}>{data.totalPoints}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div className={styles.summary}>
        <div className={styles.summaryLeft}>
          <div className={styles.sectionHeader}>Bilan de l'élève</div>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td className={styles.headerCell} colSpan={3}>Heures d'absences</td>
              </tr>
              <tr>
                <td className={styles.headerCell}>Total</td>
                <td className={styles.headerCell}>Justifiées</td>
                <td className={styles.headerCell}>Non Justifiées</td>
              </tr>
              <tr>
                <td className={styles.dataCell}>{data.absencesTotal}</td>
                <td className={styles.dataCell}>{data.absencesJustified}</td>
                <td className={styles.dataCell}>{data.absencesUnjustified}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.sectionHeader}>
            Résultat :
            {data.term.toUpperCase()}
          </div>
          <table className={styles.resultTable}>
            <tbody>
              <tr>
                <td className={styles.resultLabel}>Moyenne :</td>
                <td>{data.studentAverage}</td>
              </tr>
              <tr>
                <td className={styles.resultLabel}>Classement :</td>
                <td>{data.studentRank}</td>
              </tr>
              <tr>
                <td className={styles.resultLabel}>Rappel 1er Trim :</td>
                <td>{data.studentRecallTrim1}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.summaryRight}>
          <div className={styles.sectionHeader}>
            Bilan de la classe :
            {data.term.toUpperCase()}
          </div>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td className={styles.headerCell}>MOY MAXI</td>
                <td className={styles.headerCell}>MOY MINI</td>
                <td className={styles.headerCell}>MOY CLASSE</td>
              </tr>
              <tr>
                <td className={styles.dataCell}>{data.classMoyMaxi}</td>
                <td className={styles.dataCell}>{data.classMoyMini}</td>
                <td className={styles.dataCell}>{data.classMoyClasse}</td>
              </tr>
            </tbody>
          </table>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td className={styles.headerCell}>{'MOY < 8.5'}</td>
                <td className={styles.headerCell}>{'8.5 <= MOY <= 10'}</td>
                <td className={styles.headerCell}>{'MOY > 10'}</td>
              </tr>
              <tr>
                <td className={styles.dataCell}>{data.classMoyLt85}</td>
                <td className={styles.dataCell}>{data.classMoy85To10}</td>
                <td className={styles.dataCell}>{data.classMoyGt10}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.mention}>
        <div className={styles.mentionLeft}>
          <div className={styles.sectionHeader}>DISTINCTION</div>
          <div>
            {data.distinctionsAvailable.map(d => (
              <div key={d.label}>
                <span className={`${styles.checkbox} ${d.checked ? styles.checkboxChecked : ''}`}></span>
                {' '}
                {d.label}
              </div>
            ))}
          </div>
          <div className={styles.sectionHeader} style={{ marginTop: '10px' }}>SANCTION</div>
          <div>
            {data.sanctionsAvailable.map(s => (
              <div key={s.label}>
                <span className={`${styles.checkbox} ${s.checked ? styles.checkboxChecked : ''}`}></span>
                {' '}
                {s.label}
              </div>
            ))}
          </div>
          <div className={styles.sectionHeader} style={{ marginTop: '10px' }}>Appréciation du conseil de classe</div>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>{data.appreciationText}</div>
        </div>
        <div className={styles.mentionRight}>
          <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>{data.headTeacherSignatureLabel}</div>
          <div className={styles.signatureSpace}></div>
          <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>{data.principalTeacherLabel}</div>
          <div style={{ textAlign: 'center' }}>{data.principalTeacherName}</div>
          <div className={styles.signatureSpace}></div>
          <div style={{ textAlign: 'right' }}>
            {data.reportDateLabel}
            {' '}
            <span>{data.reportDate}</span>
          </div>
        </div>
      </div>

      <footer className={styles.pageFooter}>
        <div>{data.footerSchoolName}</div>
        <div>{data.footerYekoVersion}</div>
        <div>{data.footerDisclaimer}</div>
      </footer>
    </div>
  )
}

export default ReportCardDisplay
