export const environment = {
    production: false,
    name: 'test',
    version: '2.1.5',
    oclaviServer: 'http://104.196.190.173:8080/oapi/',
    oclaviUi: 'http://104.196.190.173:4200/',
    socketIOServer: 'http://104.196.190.173:8080/',
    amipodServer: 'http://104.196.190.173:8010/api/',
    autoSaveTime: 5000,
    inactivityTime: 6000,
    training_error: 0.5,
    displayAdDelay: 2000,
    USER_TYPE: {
        SELF: {
            NAME: "self",
            PROPER_NAME: "Self"
        },
        STUDENT_SELF: {
            NAME: "student-self",
            PROPER_NAME: "Student Self"
        },
        FREELANCER: {
            NAME: "freelancer",
            PROPER_NAME: "Freelancer"
        },
        TEAM: {
            NAME: "team",
            PROPER_NAME: "Team User"
        },
        ADMIN: {
            NAME: "admin",
            PROPER_NAME: "Admin"
        },
        STUDENT_ADMIN: {
            NAME: "student-admin",
            PROPER_NAME: "Student Admin"
        }
    },
    CANVAS_DOT: {
        NORMAL: {
            FILL_COLOR: '#FBFF00',
            SIZE: 4
        },
        SELECT: {
            FILL_COLOR: '#1E5BFE',
            SIZE: 6
        }
    },
    CANVAS_SHAPE: {
        NORMAL: {
            FILL_COLOR: '#FBFF00',
            STROKE_COLOR: '#FF0000',
            LINE_WIDTH: 3
        },
        SELECT: {
            STROKE_COLOR: '#C6F337',
            LINE_WIDTH: 4
        }
    },
    CANVAS_TEXT: {
        NORMAL: {
            FONT: '20px Georgia',
            COLOR: '#4AFE1E'
        },
        SELECT: {
            FONT: '20px Georgia',
            COLOR: '#4AFE1E'
        }
    },
    BACKOFFICE_TAB: {
        dashboard: 'Dashboard',
        my_project: 'My Project',
        project_settings: 'Project Settings',
        image_settings: 'Image Settings',
        label_settings: 'Label Settings',
        view_image: 'View Image',
        change_password: 'Change Password',
        docs: 'Docs',
        payment: 'Payment',
        how_to_work: 'Video Tutorials',
        profile_settings: 'Profile Settings',
        invite_users: 'Invite Users'
    },

    STORAGE_TYPE: {
        S3: 'Amazon S3',
        GOOGLE_DRIVE: 'Google Drive',
        DROPBOX: 'Dropbox',
        GCP: 'GCP',
        ONEDRIVE: 'One Drive'
    },

    IMAGE_STATUS: {
        CLASSIFIED: 'Classified',
        NEW: 'Not Classified',
        ASSIGNED: 'In Progress'
    },

    SHAPES: {
        EDGES_RECT: 'rect',
        EDGES_POLY: 'poly',
        EDGES_CIRCLE: 'circle',
        EDGES_CUBOID: 'cuboid',
        EDGES_POINT: 'point'
    },

    SHAPES_FULL_NAME: {
        rect: {
            NAME: 'Rectangle',
            CANVAS_NAME: 'R'
        },
        poly: {
            NAME: 'Polygon',
            CANVAS_NAME: 'P'
        },
        circle: {
            NAME: 'Circle',
            CANVAS_NAME: 'C'
        },
        cuboid: {
            NAME: 'Cuboid',
            CANVAS_NAME: 'Cu'
        },
        point: {
            NAME: 'Point',
            CANVAS_NAME: 'D'
        }
    },
    FREELANCER_PROJECT_IMG_LIMIT : [
        {
            MIN_IMAGES: 1,
            MAX_IMAGES: 200,
            PERCENTAGE: 10
        }, {
            MIN_IMAGES: 201,
            MAX_IMAGES: 500,
            PERCENTAGE: 8
        }, {
            MIN_IMAGES: 501,
            MAX_IMAGES: 1000,
            PERCENTAGE: 7
        }, {
            MIN_IMAGES: 1001,
            MAX_IMAGES: 5000,
            PERCENTAGE: 4
        }, {
            MIN_IMAGES: 5001,
            MAX_IMAGES: 1000000,
            PERCENTAGE: 2
        }
    ],
    PROJECT_TYPE: {
        image_segmentation: 'SEGMENTATION',
        image_tagging: 'TAGGING'
    },
    FILE_TYPE: {
        file_video: 'VIDEO',
        file_image: 'IMAGE'
    }
};
