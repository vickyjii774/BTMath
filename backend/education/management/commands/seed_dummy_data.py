from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from education.models import (
    Category,
    Program,
    AcademicPeriod,
    Subject,
    AccessGroup,
    UserAccessGroup,
    Course,
    Chapter,
    Lesson,
    Material,
    UserProfile,
    Enrollment,
    Payment,
    Purchase,
    ContactMessage,
    SocialLink,
    SiteStatistic,
    AuditLog,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed comprehensive BTMath dummy data for all academic levels, access groups, courses, and students."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting BTMath comprehensive dummy data seeding..."))

        # ------------------------------------------------------------------
        # 1. Admin Superuser
        # ------------------------------------------------------------------
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@btmath.com",
                "first_name": "BTMath",
                "last_name": "Instructor",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("adminpassword123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created superuser 'admin' (password: adminpassword123)"))
        else:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()

        admin_profile, _ = UserProfile.objects.get_or_create(
            user=admin_user,
            defaults={
                "role": "admin",
                "full_name": "BTMath Faculty Lead",
                "phone": "+977-9800000000",
                "education_level": "master",
            },
        )

        # ------------------------------------------------------------------
        # 2. Categories
        # ------------------------------------------------------------------
        cat_configs = [
            ("plus-two", "+2 Mathematics", "Grade 11 & Grade 12 National Examination Board Mathematics courses"),
            ("bachelor", "Bachelor Mathematics", "Undergraduate university mathematics for BSc, BCA, CSIT, BIM & Engineering"),
            ("master", "Master Mathematics", "Postgraduate M.Sc. & M.A. Mathematics programs and advanced analysis"),
            ("ioe", "IOE Entrance", "IOE Pulchowk Engineering Entrance examination preparation and shortcut tricks"),
        ]
        categories = {}
        for code, name, desc in cat_configs:
            cat, _ = Category.objects.get_or_create(
                level=code,
                defaults={"name": name, "description": desc},
            )
            categories[code] = cat

        # ------------------------------------------------------------------
        # 3. Programs
        # ------------------------------------------------------------------
        prog_configs = [
            ("+2 Science", "plus-two", "NEB Grade 11 & 12 Science stream mathematics syllabus", "2 Years"),
            ("+2 Management", "plus-two", "NEB Business Mathematics for Management students", "2 Years"),
            ("B.Sc. Mathematics", "bachelor", "Tribhuvan University 4-Year Bachelor of Science in Mathematics", "4 Years"),
            ("B.Sc. CSIT", "bachelor", "Bachelor of Science in Computer Science and Information Technology", "4 Years (8 Semesters)"),
            ("BCA", "bachelor", "Bachelor in Computer Application Mathematics curricula", "4 Years (8 Semesters)"),
            ("BIM", "bachelor", "Bachelor of Information Management Mathematics & Statistics", "4 Years (8 Semesters)"),
            ("M.Sc. Mathematics", "master", "Master level Advanced Real Analysis, Topology & Complex Analysis", "2 Years (4 Semesters)"),
            ("IOE Engineering Entrance Preparation", "ioe", "Entrance preparation for Tribhuvan University IOE Pulchowk Engineering", "Crash / Intensive Prep"),
        ]
        programs = {}
        for name, cat_key, desc, dur in prog_configs:
            prog, _ = Program.objects.get_or_create(
                name=name,
                category=categories[cat_key],
                defaults={
                    "description": desc,
                    "duration_info": dur,
                },
            )
            programs[name] = prog

        # ------------------------------------------------------------------
        # 4. Academic Periods / Academic Units
        # ------------------------------------------------------------------
        units = {}
        unit_configs = [
            ("+2 Science", [("Grade 11", "year", 1), ("Grade 12", "year", 2)]),
            ("+2 Management", [("Grade 11 Management", "year", 1), ("Grade 12 Management", "year", 2)]),
            ("B.Sc. Mathematics", [("First Year", "year", 1), ("Second Year", "year", 2), ("Third Year", "year", 3), ("Fourth Year", "year", 4)]),
            ("B.Sc. CSIT", [("Semester 1", "semester", 1), ("Semester 2", "semester", 2)]),
            ("BCA", [("Semester 1", "semester", 1), ("Semester 2", "semester", 2)]),
            ("BIM", [("Semester 1", "semester", 1), ("Semester 2", "semester", 2)]),
            ("M.Sc. Mathematics", [("First Semester", "semester", 1), ("Second Semester", "semester", 2)]),
            ("IOE Engineering Entrance Preparation", [("Entrance Prep Unit", "semester", 1)]),
        ]
        for prog_name, period_list in unit_configs:
            for p_name, p_type, p_order in period_list:
                key = f"{prog_name}_{p_order}"
                unit, _ = AcademicPeriod.objects.get_or_create(
                    program=programs[prog_name],
                    name=p_name,
                    defaults={"period_type": p_type, "order": p_order},
                )
                units[key] = unit

        # ------------------------------------------------------------------
        # 5. Access Groups (Master Specification Core)
        # ------------------------------------------------------------------
        ag_configs = [
            ("PLUS_TWO", "Plus Two Mathematics All-Access", "Grants full access to all +2 Science, Management & Business Mathematics courses and past question papers."),
            ("BACHELOR", "Bachelor Mathematics All-Access", "Grants access to all undergraduate university courses across BSc, BCA, CSIT, BIM and Engineering Mathematics."),
            ("MASTER", "Master Mathematics Advanced Bundle", "Grants complete access to postgraduate Master of Science in Mathematics resources and advanced lecture notes."),
            ("IOE", "IOE Engineering Entrance Preparation Package", "Full access to IOE solved past questions, short tricks, model questions, and formula sheets."),
        ]
        access_groups = {}
        for slug, name, desc in ag_configs:
            ag, _ = AccessGroup.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": desc, "is_active": True},
            )
            access_groups[slug] = ag

        # ------------------------------------------------------------------
        # 6. Subjects
        # ------------------------------------------------------------------
        sub_configs = [
            ("Science Mathematics 11", "SM-11", "+2 Science", "+2 Science_1"),
            ("Science Mathematics 12", "SM-12", "+2 Science", "+2 Science_2"),
            ("Business Mathematics 11", "BM-11", "+2 Management", "+2 Management_1"),
            ("Calculus & Analytical Geometry", "CSC-109", "B.Sc. CSIT", "B.Sc. CSIT_1"),
            ("Linear Algebra", "CSC-160", "B.Sc. CSIT", "B.Sc. CSIT_2"),
            ("Calculus I", "MATH-101", "B.Sc. Mathematics", "B.Sc. Mathematics_1"),
            ("BCA Mathematics I", "BCA-103", "BCA", "BCA_1"),
            ("Advanced Real Analysis", "MATH-501", "M.Sc. Mathematics", "M.Sc. Mathematics_1"),
            ("IOE Mathematics & Shortcuts", "IOE-MTH", "IOE Engineering Entrance Preparation", "IOE Engineering Entrance Preparation_1"),
        ]
        subjects = {}
        for name, code, prog_name, unit_key in sub_configs:
            subj, _ = Subject.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "program": programs[prog_name],
                    "academic_period": units.get(unit_key),
                },
            )
            subjects[code] = subj

        # ------------------------------------------------------------------
        # 7. Courses
        # ------------------------------------------------------------------
        course_configs = [
            (
                "Grade 11 Science Mathematics",
                "grade-11-science-mathematics",
                "Complete conceptual course for NEB Grade 11 Science Mathematics including Calculus, Algebra, and Trigonometry.",
                "+2 Science",
                "+2 Science_1",
                "SM-11",
                "PLUS_TWO",
                1500,
                1200,
            ),
            (
                "Grade 12 Science Mathematics",
                "grade-12-science-mathematics",
                "Comprehensive syllabus coverage for Grade 12 Board examinations with past papers and model questions.",
                "+2 Science",
                "+2 Science_2",
                "SM-12",
                "PLUS_TWO",
                1500,
                1200,
            ),
            (
                "Grade 11 & 12 Business Mathematics",
                "business-mathematics-plus-two",
                "Step-by-step business mathematics, matrices, commercial arithmetic, and financial mathematics for management students.",
                "+2 Management",
                "+2 Management_1",
                "BM-11",
                "PLUS_TWO",
                1200,
                999,
            ),
            (
                "B.Sc. CSIT Calculus & Analytical Geometry",
                "csit-calculus-analytical-geometry",
                "Semester 1 Mathematics course covering differentiation, partial derivatives, 3D geometry, and infinite series.",
                "B.Sc. CSIT",
                "B.Sc. CSIT_1",
                "CSC-109",
                "BACHELOR",
                2000,
                1600,
            ),
            (
                "B.Sc. CSIT Linear Algebra",
                "csit-linear-algebra",
                "Semester 2 Linear Algebra covering vector spaces, eigenvalues, eigenvectors, and matrix diagonalization.",
                "B.Sc. CSIT",
                "B.Sc. CSIT_2",
                "CSC-160",
                "BACHELOR",
                1800,
                1499,
            ),
            (
                "B.Sc. First Year Calculus",
                "bsc-first-year-calculus",
                "Tribhuvan University standard First Year Calculus covering limits, continuity, mean value theorems, and Riemann integration.",
                "B.Sc. Mathematics",
                "B.Sc. Mathematics_1",
                "MATH-101",
                "BACHELOR",
                1800,
                1499,
            ),
            (
                "BCA Mathematics I",
                "bca-mathematics-1",
                "Complete first semester mathematics covering functions, limits, matrices, differential calculus, and basic statistics.",
                "BCA",
                "BCA_1",
                "BCA-103",
                "BACHELOR",
                1500,
                1200,
            ),
            (
                "Advanced Real Analysis (Master Mathematics)",
                "master-real-analysis",
                "Advanced graduate course covering metric spaces, compact sets, Lebesgue integration, and measure theory.",
                "M.Sc. Mathematics",
                "M.Sc. Mathematics_1",
                "MATH-501",
                "MASTER",
                2500,
                1999,
            ),
            (
                "IOE Mathematics Mastery & Shortcut Tricks",
                "ioe-mathematics-mastery",
                "Comprehensive entrance preparation with 50+ time-saving shortcuts, past 10 years question solutions, and computer test practice.",
                "IOE Engineering Entrance Preparation",
                "IOE Engineering Entrance Preparation_1",
                "IOE-MTH",
                "IOE",
                2200,
                1799,
            ),
        ]

        courses = {}
        for title, slug, desc, p_name, u_key, s_code, ag_slug, price, disc_price in course_configs:
            crs, _ = Course.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "description": desc,
                    "program": programs[p_name],
                    "academic_period": units.get(u_key),
                    "subject": subjects.get(s_code),
                    "access_group": access_groups.get(ag_slug),
                    "price": price,
                    "discount_price": disc_price,
                    "course_type": "paid",
                    "instructor": "BTMath Faculty Lead",
                    "is_published": True,
                },
            )
            courses[slug] = crs

        # ------------------------------------------------------------------
        # 8. Chapters & Lessons (with real YouTube math URLs)
        # ------------------------------------------------------------------
        chapter_data = [
            (
                "grade-11-science-mathematics",
                "Unit 1: Sets, Relations & Functions",
                1,
                [
                    ("Sets & Cardinality Fundamentals", "Overview of set representations, subsets, power sets, and De Morgan's Laws.", "https://www.youtube.com/watch?v=aircAruvnKk", 1),
                    ("Domain, Range & Special Functions", "Step-by-step determination of domain and range of algebraic and rational functions.", "https://www.youtube.com/watch?v=52tpYl2tTqk", 2),
                ],
            ),
            (
                "grade-11-science-mathematics",
                "Unit 2: Trigonometry & Equations",
                2,
                [
                    ("Compound & Multiple Angle Identities", "Mastering essential trigonometric identities and proof methods.", "https://www.youtube.com/watch?v=9vKqVkMQHKk", 1),
                    ("General Solutions of Trigonometric Equations", "Finding all solutions in given intervals for board exams.", "https://www.youtube.com/watch?v=WUvTyaaNkzM", 2),
                ],
            ),
            (
                "grade-11-science-mathematics",
                "Unit 3: Calculus — Limits & Continuity",
                3,
                [
                    ("Intuitive Introduction to Limits", "Understanding limits from first principles and epsilon-delta intuition.", "https://www.youtube.com/watch?v=9vKqVkMQHKk", 1),
                    ("Standard Limit Formulas & L'Hopital's Rule", "Solving indeterminate forms 0/0 and inf/inf effortlessly.", "https://www.youtube.com/watch?v=aircAruvnKk", 2),
                ],
            ),
            (
                "ioe-mathematics-mastery",
                "Calculus Shortcuts for IOE Entrance",
                1,
                [
                    ("5-Second Limit Evaluation Tricks", "Special series expansion shortcuts and L'Hopital rules for entrance speed.", "https://www.youtube.com/watch?v=aircAruvnKk", 1),
                    ("Definite Integral Symmetry & King's Rule", "Evaluating difficult trigonometric definite integrals in under 30 seconds.", "https://www.youtube.com/watch?v=WUvTyaaNkzM", 2),
                ],
            ),
            (
                "ioe-mathematics-mastery",
                "Vectors & 3D Geometry Fast Solving",
                2,
                [
                    ("Shortest Distance Between Skew Lines", "Fast determinant formula avoiding long symmetric coordinate calculations.", "https://www.youtube.com/watch?v=52tpYl2tTqk", 1),
                    ("Plane & Straight Line Intersection Shortcuts", "Identifying coplanarity and foot of perpendicular directly from options.", "https://www.youtube.com/watch?v=9vKqVkMQHKk", 2),
                ],
            ),
            (
                "csit-calculus-analytical-geometry",
                "Differential Calculus & Applications",
                1,
                [
                    ("Rolle's & Mean Value Theorems", "Rigorous proofs and engineering applications in approximation.", "https://www.youtube.com/watch?v=9vKqVkMQHKk", 1),
                    ("Partial Derivatives & Euler's Theorem", "Handling homogeneous functions and multivariable chain rules.", "https://www.youtube.com/watch?v=aircAruvnKk", 2),
                ],
            ),
        ]

        for course_slug, ch_title, ch_order, lesson_list in chapter_data:
            course_obj = courses.get(course_slug)
            if not course_obj:
                continue

            chapter_obj, _ = Chapter.objects.update_or_create(
                course=course_obj,
                order=ch_order,
                defaults={"title": ch_title, "description": f"Detailed coverage of {ch_title}"},
            )

            for l_title, l_desc, v_url, l_order in lesson_list:
                Lesson.objects.update_or_create(
                    chapter=chapter_obj,
                    order=l_order,
                    defaults={
                        "title": l_title,
                        "description": l_desc,
                        "content": f"# {l_title}\n\n{l_desc}\n\n### Key Takeaways\n- Master the conceptual core before attempting practice problems.\n- Memorize the key definitions and formulas.\n- Solve past examination questions provided in the materials section.",
                        "video_url": v_url,
                        "is_published": True,
                    },
                )

        # ------------------------------------------------------------------
        # 9. Materials (PDFs, DOCX, Past Questions, Formula Sheets, Tricks)
        # ------------------------------------------------------------------
        sample_pdf = "materials/7_a_side_futsal_tournament_estimation_16_vs_20_teams.pdf"
        sample_docx = "materials/NELD_Research_Proposal_Proper_Academic_Proposal.docx"

        material_configs = [
            (
                "Grade 11 Sets & Functions Comprehensive Handout PDF",
                "pdf",
                "grade-11-science-mathematics",
                sample_pdf,
                "Free introductory chapter notes covering Sets and Functions.",
                True,
            ),
            (
                "Grade 11 Calculus Hand-written Lecture Notes DOCX",
                "docx",
                "grade-11-science-mathematics",
                sample_docx,
                "Editable Microsoft Word document containing detailed formulas and solved examples.",
                False,
            ),
            (
                "IOE Entrance 2080 Past Question Paper with Detailed Solutions",
                "past_question",
                "ioe-mathematics-mastery",
                sample_pdf,
                "Complete solved mathematics section from the 2080 computer entrance exam.",
                False,
            ),
            (
                "IOE Entrance 2079 Past Question Paper",
                "past_question",
                "ioe-mathematics-mastery",
                sample_pdf,
                "Solved mathematics questions from the 2079 IOE entrance batch.",
                False,
            ),
            (
                "Top 50 Mathematics Short Tricks for IOE Entrance Handbook",
                "trick",
                "ioe-mathematics-mastery",
                sample_pdf,
                "The famous BTMath 50 golden shortcuts for algebra, calculus and geometry.",
                False,
            ),
            (
                "Complete +2 & IOE Mathematics Formula Handbook",
                "formula_sheet",
                "ioe-mathematics-mastery",
                sample_pdf,
                "Pocket formula booklet containing every formula required for NEB and Entrance.",
                True,
            ),
            (
                "CSIT Semester 1 Calculus Master Problem Set PDF",
                "pdf",
                "csit-calculus-analytical-geometry",
                sample_pdf,
                "TU past exam problem sets with step-by-step solutions.",
                False,
            ),
        ]

        for m_title, m_type, c_slug, m_file, m_desc, is_free in material_configs:
            course_obj = courses.get(c_slug)
            Material.objects.update_or_create(
                title=m_title,
                course=course_obj,
                defaults={
                    "material_type": m_type,
                    "access_type": "free" if is_free else "paid",
                    "description": m_desc,
                    "file": m_file,
                    "is_published": True,
                },
            )

        # ------------------------------------------------------------------
        # 10. Test Students & Profiles (BTM-XXXXXX IDs)
        # ------------------------------------------------------------------
        student_configs = [
            ("ramesh", "ramesh@example.com", "Ramesh Sharma", "+977-9841234567", "plus_two", False, "PLUS_TWO"),
            ("sita", "sita@example.com", "Sita Thapa", "+977-9812345678", "ioe", False, "IOE"),
            ("anup", "anup@example.com", "Anup Shrestha", "+977-9851122334", "bachelor", False, "BACHELOR"),
            ("puja", "puja@example.com", "Puja Adhikari", "+977-9860987654", "plus_two", False, None),
            ("kiran", "kiran@example.com", "Kiran Poudel", "+977-9849876543", "bachelor", True, None),
        ]

        students = {}
        for username, email, full_name, phone, ed_level, is_disabled, ag_grant in student_configs:
            u, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "first_name": full_name.split()[0], "last_name": full_name.split()[1]},
            )
            u.set_password("student123")
            u.save()

            profile, p_created = UserProfile.objects.get_or_create(
                user=u,
                defaults={
                    "full_name": full_name,
                    "phone": phone,
                    "education_level": ed_level,
                    "is_disabled": is_disabled,
                },
            )
            profile.is_disabled = is_disabled
            profile.save()
            students[username] = (u, profile)

            # If student has an active access group grant, activate it
            if ag_grant:
                ag_obj = access_groups.get(ag_grant)
                if ag_obj:
                    UserAccessGroup.objects.get_or_create(
                        user=u,
                        access_group=ag_obj,
                        defaults={
                            "is_active": True,
                            "granted_by": admin_user,
                            "expires_at": timezone.now() + timedelta(days=365),
                        },
                    )

        # ------------------------------------------------------------------
        # 11. Payments & Purchases
        # ------------------------------------------------------------------
        # 1. Ramesh - Approved payment for Grade 11 Science
        ramesh_user = students["ramesh"][0]
        c_g11 = courses["grade-11-science-mathematics"]
        p1, _ = Payment.objects.get_or_create(
            user=ramesh_user,
            course=c_g11,
            defaults={
                "amount": 1200,
                "payment_method": "esewa",
                "transaction_code": "ESEWA-98127391",
                "status": "approved",
                "verified_by": admin_user,
                "verified_at": timezone.now(),
            },
        )
        Purchase.objects.get_or_create(
            user=ramesh_user,
            course=c_g11,
            defaults={
                "access_group": access_groups["PLUS_TWO"],
                "payment": p1,
                "amount": 1200,
                "is_active": True,
            },
        )
        Enrollment.objects.get_or_create(user=ramesh_user, course=c_g11, defaults={"status": "active"})

        # 2. Sita - Approved payment for IOE Mathematics
        sita_user = students["sita"][0]
        c_ioe = courses["ioe-mathematics-mastery"]
        p2, _ = Payment.objects.get_or_create(
            user=sita_user,
            course=c_ioe,
            defaults={
                "amount": 1799,
                "payment_method": "khalti",
                "transaction_code": "KHALTI-4482910",
                "status": "approved",
                "verified_by": admin_user,
                "verified_at": timezone.now(),
            },
        )
        Purchase.objects.get_or_create(
            user=sita_user,
            course=c_ioe,
            defaults={
                "access_group": access_groups["IOE"],
                "payment": p2,
                "amount": 1799,
                "is_active": True,
            },
        )
        Enrollment.objects.get_or_create(user=sita_user, course=c_ioe, defaults={"status": "active"})

        # 3. Puja - Pending payment for Grade 12 Science awaiting verification
        puja_user = students["puja"][0]
        c_g12 = courses["grade-12-science-mathematics"]
        Payment.objects.get_or_create(
            user=puja_user,
            course=c_g12,
            defaults={
                "amount": 1200,
                "payment_method": "bank_transfer",
                "transaction_code": "QR-NMB-88129031",
                "status": "pending",
                "payment_proof": sample_pdf,
            },
        )

        # 4. Anup - Approved payment for CSIT Calculus
        anup_user = students["anup"][0]
        c_csit = courses["csit-calculus-analytical-geometry"]
        p4, _ = Payment.objects.get_or_create(
            user=anup_user,
            course=c_csit,
            defaults={
                "amount": 1600,
                "payment_method": "esewa",
                "transaction_code": "ESEWA-7726190",
                "status": "approved",
                "verified_by": admin_user,
                "verified_at": timezone.now(),
            },
        )
        Purchase.objects.get_or_create(
            user=anup_user,
            course=c_csit,
            defaults={
                "access_group": access_groups["BACHELOR"],
                "payment": p4,
                "amount": 1600,
                "is_active": True,
            },
        )
        Enrollment.objects.get_or_create(user=anup_user, course=c_csit, defaults={"status": "active"})

        # ------------------------------------------------------------------
        # 12. Contact Messages & Inquiries
        # ------------------------------------------------------------------
        ContactMessage.objects.get_or_create(
            email="roshan@example.com",
            subject="Inquiry regarding IOE entrance mock computer tests",
            defaults={
                "name": "Roshan Gurung",
                "phone": "9811223344",
                "message": "Hello Sir, I wanted to inquire if the IOE entrance mathematics package includes weekly mock test papers according to the revised IOE computer-based syllabus?",
                "is_read": False,
            },
        )
        ContactMessage.objects.get_or_create(
            email="deepa@example.com",
            subject="Class schedule for Grade 11 Science Math",
            defaults={
                "name": "Deepa Bhatta",
                "phone": "9822334455",
                "message": "Are recorded video lectures available for self-paced study or is there a live session schedule?",
                "is_read": True,
                "is_replied": True,
                "admin_notes": "Replied via email explaining that all lectures are on-demand videos.",
            },
        )

        # ------------------------------------------------------------------
        # 13. Social Links
        # ------------------------------------------------------------------
        social_data = [
            ("youtube", "BTMath Official YouTube", "https://www.youtube.com/@btmath", 1),
            ("facebook", "BTMath Facebook Page", "https://www.facebook.com/btmathnepal", 2),
            ("whatsapp", "BTMath Student Helpdesk WhatsApp", "https://wa.me/9779800000000", 3),
            ("tiktok", "BTMath Short Tricks on TikTok", "https://www.tiktok.com/@btmath", 4),
            ("instagram", "BTMath Official Instagram", "https://www.instagram.com/btmath", 5),
        ]
        for plat, title, url, order in social_data:
            SocialLink.objects.update_or_create(
                platform=plat,
                defaults={"title": title, "url": url, "order": order, "is_active": True},
            )

        # ------------------------------------------------------------------
        # 14. Site Statistics
        # ------------------------------------------------------------------
        stat_obj, _ = SiteStatistic.objects.get_or_create(id=1)
        if stat_obj.total_visitors < 12000:
            stat_obj.total_visitors = 12850
            stat_obj.total_page_views = 49200
            stat_obj.save()

        # ------------------------------------------------------------------
        # 15. Audit Logs
        # ------------------------------------------------------------------
        AuditLog.objects.get_or_create(
            action="seed_database",
            target_type="System",
            defaults={
                "admin": admin_user,
                "target_id": "seed_001",
                "description": "Seeded platform initial dummy dataset including access groups, courses, lessons, and students.",
                "ip_address": "127.0.0.1",
            },
        )

        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("BTMATH DUMMY DATA SEED COMPLETED SUCCESSFULLY!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"Categories: {Category.objects.count()}")
        self.stdout.write(f"Programs: {Program.objects.count()}")
        self.stdout.write(f"Academic Units: {AcademicPeriod.objects.count()}")
        self.stdout.write(f"Access Groups: {AccessGroup.objects.count()} (PLUS_TWO, BACHELOR, MASTER, IOE)")
        self.stdout.write(f"Courses: {Course.objects.count()}")
        self.stdout.write(f"Chapters: {Chapter.objects.count()}")
        self.stdout.write(f"Lessons: {Lesson.objects.count()}")
        self.stdout.write(f"Materials: {Material.objects.count()}")
        self.stdout.write(f"Students: {UserProfile.objects.count()}")
        self.stdout.write(f"Payments: {Payment.objects.count()}")
        self.stdout.write(f"Purchases: {Purchase.objects.count()}")
        self.stdout.write(f"Social Links: {SocialLink.objects.count()}")
        self.stdout.write(f"Contact Messages: {ContactMessage.objects.count()}")
        self.stdout.write("Credentials:")
        self.stdout.write("  Super Admin: username='admin', password='adminpassword123'")
        self.stdout.write("  Students (password: 'student123'):")
        for u_name, (u_obj, p_obj) in students.items():
            self.stdout.write(f"    - {u_name} -> ID: {p_obj.student_id} | Email: {u_obj.email} | Disabled: {p_obj.is_disabled}")
        self.stdout.write(self.style.SUCCESS("=" * 60))
