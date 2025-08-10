-- SQL script to populate conduct_incidents table from existing attendance data
-- This will create incidents for absences and lates to reflect actual conduct issues

-- First, let's get the current school year and semester
DO $$
DECLARE
    current_school_year_id INTEGER;
    current_semester_id INTEGER;
    system_user_id UUID;
    incident_count INTEGER := 0;
BEGIN
    -- Get current school year
    SELECT id INTO current_school_year_id FROM school_years WHERE is_current = true LIMIT 1;
    
    -- Get current semester
    SELECT id INTO current_semester_id FROM semesters WHERE is_current = true LIMIT 1;
    
    -- Get a system user (director or teacher) to attribute incidents to
    -- We'll use the first director we find, or create a system user
    SELECT u.id INTO system_user_id
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = 3 -- DIRECTOR role
    LIMIT 1;
    
    -- If no director found, use the first user with a school
    IF system_user_id IS NULL THEN
        SELECT id INTO system_user_id
        FROM users
        WHERE school_id IS NOT NULL
        LIMIT 1;
    END IF;
    
    -- Verify we have the required data
    IF current_school_year_id IS NULL THEN
        RAISE EXCEPTION 'No current school year found. Please set is_current = true for a school year.';
    END IF;
    
    IF current_semester_id IS NULL THEN
        RAISE EXCEPTION 'No current semester found. Please set is_current = true for a semester.';
    END IF;
    
    IF system_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found to attribute incidents to. Please ensure there are users in the system.';
    END IF;
    
    RAISE NOTICE 'Using school year ID: %, semester ID: %, system user ID: %', current_school_year_id, current_semester_id, system_user_id;
    
    -- Insert conduct incidents for ABSENT attendances
    INSERT INTO conduct_incidents (
        student_id,
        category_id,
        description,
        points_deducted,
        reported_by,
        reported_at,
        school_year_id,
        semester_id,
        is_active
    )
    SELECT DISTINCT
        a.student_id,
        'attendance' as category_id,
        CASE 
            WHEN a.reason IS NOT NULL AND a.reason != '' THEN
                'Absence du ' || COALESCE(TO_CHAR(a.created_date::date, 'DD/MM/YYYY'), TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY')) || ' à ' || a.starts_at || ' - Raison: ' || a.reason
            ELSE
                'Absence injustifiée du ' || COALESCE(TO_CHAR(a.created_date::date, 'DD/MM/YYYY'), TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY')) || ' à ' || a.starts_at
        END as description,
        CASE 
            WHEN a.is_excused = true THEN 0.0  -- No points deducted for excused absences
            ELSE 0.5  -- 0.5 points per unjustified absence
        END as points_deducted,
        system_user_id as reported_by,
        COALESCE(a.created_date, CURRENT_DATE)::timestamp + a.starts_at::time as reported_at,
        current_school_year_id as school_year_id,
        current_semester_id as semester_id,
        true as is_active
    FROM attendances a
    WHERE a.status = 'absent'
        AND a.school_years_id = current_school_year_id
        AND a.semesters_id = current_semester_id
        AND a.is_excused = false  -- Only create incidents for unexcused absences
        -- Avoid duplicates by checking if incident doesn't already exist
        AND NOT EXISTS (
            SELECT 1 FROM conduct_incidents ci 
            WHERE ci.student_id = a.student_id 
                AND ci.category_id = 'attendance'
                AND ci.reported_at::date = COALESCE(a.created_date::date, CURRENT_DATE)
                AND ci.description LIKE '%Absence%'
        );
    
    GET DIAGNOSTICS incident_count = ROW_COUNT;
    RAISE NOTICE 'Created % incidents for absent attendances', incident_count;
    
    -- LATE ATTENDANCES PROCESSING COMMENTED OUT
    -- As per ministry guidelines update, only absent status is processed
    -- Original late processing logic removed to align with new requirements
    
    RAISE NOTICE 'Late attendance processing skipped as per ministry guidelines update';
    
    -- Now let's update conduct scores based on the incidents we just created
    -- First, let's calculate attendance scores for each student
    INSERT INTO conduct_scores (
        student_id,
        school_year_id,
        semester_id,
        attendance_score,
        dresscode_score,
        morality_score,
        discipline_score,
        grade
    )
    SELECT 
        s.id as student_id,
        current_school_year_id as school_year_id,
        current_semester_id as semester_id,
        -- Calculate attendance score based on incidents
        GREATEST(0, 6.0 - COALESCE((
            SELECT SUM(ci.points_deducted) 
            FROM conduct_incidents ci 
            WHERE ci.student_id = s.id 
                AND ci.category_id = 'attendance'
                AND ci.school_year_id = current_school_year_id
                AND ci.semester_id = current_semester_id
                AND ci.is_active = true
        ), 0)) as attendance_score,
        3.0 as dresscode_score,    -- Default to maximum
        4.0 as morality_score,     -- Default to maximum  
        7.0 as discipline_score,   -- Default to maximum
        -- Grade will be calculated by the trigger
        'TRES_BONNE' as grade
    FROM students s
    -- Only include students who have attendance records
    WHERE EXISTS (
        SELECT 1 FROM attendances a 
        WHERE a.student_id = s.id 
            AND a.school_years_id = current_school_year_id
            AND a.semesters_id = current_semester_id
    )
    -- Avoid duplicates
    AND NOT EXISTS (
        SELECT 1 FROM conduct_scores cs 
        WHERE cs.student_id = s.id 
            AND cs.school_year_id = current_school_year_id
            AND cs.semester_id = current_semester_id
    );
    
    GET DIAGNOSTICS incident_count = ROW_COUNT;
    RAISE NOTICE 'Created conduct scores for % students', incident_count;
    
    -- Summary report
    RAISE NOTICE '=== CONDUCT INCIDENTS POPULATION COMPLETE ===';
    RAISE NOTICE 'School Year ID: %', current_school_year_id;
    RAISE NOTICE 'Semester ID: %', current_semester_id;
    RAISE NOTICE 'System User ID: %', system_user_id;
    
    -- Show summary statistics
    RAISE NOTICE 'Total conduct incidents created: %', (
        SELECT COUNT(*) FROM conduct_incidents 
        WHERE school_year_id = current_school_year_id 
            AND semester_id = current_semester_id
    );
    
    RAISE NOTICE 'Total conduct scores created: %', (
        SELECT COUNT(*) FROM conduct_scores 
        WHERE school_year_id = current_school_year_id 
            AND semester_id = current_semester_id
    );
    
    -- Show grade distribution
    RAISE NOTICE 'Grade distribution:';
    FOR incident_count IN 
        SELECT COUNT(*) as count, grade 
        FROM conduct_scores 
        WHERE school_year_id = current_school_year_id 
            AND semester_id = current_semester_id 
        GROUP BY grade 
        ORDER BY grade
    LOOP
        RAISE NOTICE '  %: % students', (
            SELECT grade FROM conduct_scores 
            WHERE school_year_id = current_school_year_id 
                AND semester_id = current_semester_id 
            GROUP BY grade 
            HAVING COUNT(*) = incident_count 
            LIMIT 1
        ), incident_count;
    END LOOP;
    
END $$;
