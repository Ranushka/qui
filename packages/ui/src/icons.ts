import type * as React from "react";
import {
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconAlertOctagon,
  IconAlertTriangle,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars5,
  IconArchive,
  IconArrowBackUp,
  IconArrowDown,
  IconArrowDownRight,
  IconArrowLeftRight,
  IconArrowRight,
  IconArrowUp,
  IconArrowUpRight,
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconBan,
  IconBed,
  IconBell,
  IconBellOff,
  IconBold,
  IconBook,
  IconBookmark,
  IconBox,
  IconBoxMultiple,
  IconBriefcase,
  IconBriefcase2,
  IconBuilding,
  IconBuildingBank,
  IconBulb,
  IconCalendar,
  IconCalendarClock,
  IconCalendarEvent,
  IconCalendarPlus,
  IconCar,
  IconCards,
  IconCashBanknote,
  IconCashMove,
  IconCategory,
  IconChartColumn,
  IconChartLine,
  IconChartPie,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDot,
  IconCircleX,
  IconClock,
  IconCode,
  IconCoffee,
  IconCoin,
  IconCoins,
  IconColumns3,
  IconCompass,
  IconComponents,
  IconCopy,
  IconCreditCard,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceFloppy,
  IconDots,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFaceId,
  IconFileSpreadsheet,
  IconFileText,
  IconFilter,
  IconFilter2,
  IconFlag,
  IconFolder,
  IconGauge,
  IconGlobe,
  IconGrid3x3,
  IconH1,
  IconHash,
  IconHelpCircle,
  IconHistory,
  IconHome,
  IconHourglass,
  IconInbox,
  IconInfoCircle,
  IconItalic,
  IconLayoutGrid,
  IconLayoutKanban,
  IconLayoutSidebar,
  IconLink,
  IconList,
  IconListCheck,
  IconListDetails,
  IconListTree,
  IconLoader2,
  IconLock,
  IconLockOpen,
  IconMail,
  IconMenu2,
  IconMessage,
  IconMessage2,
  IconMinus,
  IconNfc,
  IconPaperclip,
  IconPencil,
  IconPercentage,
  IconPhoto,
  IconPigMoney,
  IconPin,
  IconPlane,
  IconPlugConnected,
  IconPlus,
  IconPuzzle,
  IconReceipt,
  IconRefresh,
  IconRefreshDot,
  IconReload,
  IconRobot,
  IconRocket,
  IconRubberStamp,
  IconSearch,
  IconSelector,
  IconSend,
  IconSettings,
  IconShare,
  IconShieldCheck,
  IconShieldExclamation,
  IconShoppingBag,
  IconSitemap,
  IconSnowflake,
  IconSparkles,
  IconSquare,
  IconStack2,
  IconStar,
  IconSun,
  IconTable,
  IconTag,
  IconTarget,
  IconThumbDown,
  IconThumbUp,
  IconTractor,
  IconTrash,
  IconTrendingUp,
  IconTriangle,
  IconTypography,
  IconUnderline,
  IconUpload,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconWallet,
  IconWriting,
  IconX,
  IconZoomCancel,
} from "@tabler/icons-react";

/**
 * qui's icon set: every glyph the library and playground use, under one stable qui name, drawn by
 * Tabler (MIT, 24px grid, 2px rounded stroke). Components import from here, never from the pack, so
 * swapping the pack means editing only this file. Use as `<Icon icon={Icons.Settings} />`.
 */
export type Glyph = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const Activity: Glyph = IconActivity;
export const AlignCenter: Glyph = IconAlignCenter;
export const AlignLeft: Glyph = IconAlignLeft;
export const AlignRight: Glyph = IconAlignRight;
export const Archive: Glyph = IconArchive;
export const ArrowDown: Glyph = IconArrowDown;
export const ArrowDownRight: Glyph = IconArrowDownRight;
export const ArrowLeftRight: Glyph = IconArrowLeftRight;
export const ArrowRight: Glyph = IconArrowRight;
export const ArrowUp: Glyph = IconArrowUp;
export const ArrowUpRight: Glyph = IconArrowUpRight;
export const Ban: Glyph = IconBan;
export const Banknote: Glyph = IconCashBanknote;
export const BedDouble: Glyph = IconBed;
export const Bell: Glyph = IconBell;
export const BellOff: Glyph = IconBellOff;
export const Bold: Glyph = IconBold;
export const BookOpen: Glyph = IconBook;
export const Bookmark: Glyph = IconBookmark;
export const Bot: Glyph = IconRobot;
export const Box: Glyph = IconBox;
export const Briefcase: Glyph = IconBriefcase;
export const BriefcaseBusiness: Glyph = IconBriefcase2;
export const Building2: Glyph = IconBuilding;
export const Calendar: Glyph = IconCalendar;
export const CalendarClock: Glyph = IconCalendarClock;
export const CalendarDays: Glyph = IconCalendarEvent;
export const CalendarPlus: Glyph = IconCalendarPlus;
export const Car: Glyph = IconCar;
export const ChartColumn: Glyph = IconChartColumn;
export const ChartNoAxesCombined: Glyph = IconChartLine;
export const ChartPie: Glyph = IconChartPie;
export const Check: Glyph = IconCheck;
export const ChevronDown: Glyph = IconChevronDown;
export const ChevronLeft: Glyph = IconChevronLeft;
export const ChevronRight: Glyph = IconChevronRight;
export const ChevronUp: Glyph = IconChevronUp;
export const ChevronsUpDown: Glyph = IconSelector;
export const Circle: Glyph = IconCircle;
export const CircleAlert: Glyph = IconAlertCircle;
export const CircleCheck: Glyph = IconCircleCheck;
export const CircleDashed: Glyph = IconCircleDashed;
export const CircleDollarSign: Glyph = IconCoin;
export const CircleDot: Glyph = IconCircleDot;
export const CircleHelp: Glyph = IconHelpCircle;
export const CircleX: Glyph = IconCircleX;
export const Clock: Glyph = IconClock;
export const CodeXml: Glyph = IconCode;
export const Coffee: Glyph = IconCoffee;
export const Coins: Glyph = IconCoins;
export const Columns3: Glyph = IconColumns3;
export const Compass: Glyph = IconCompass;
export const Component: Glyph = IconComponents;
export const Copy: Glyph = IconCopy;
export const CreditCard: Glyph = IconCreditCard;
export const Database: Glyph = IconDatabase;
export const Download: Glyph = IconDownload;
export const Ellipsis: Glyph = IconDots;
export const ExternalLink: Glyph = IconExternalLink;
export const Eye: Glyph = IconEye;
export const FileImage: Glyph = IconPhoto;
export const FileSpreadsheet: Glyph = IconFileSpreadsheet;
export const FileText: Glyph = IconFileText;
export const Filter: Glyph = IconFilter;
export const Flag: Glyph = IconFlag;
export const Folder: Glyph = IconFolder;
export const Gauge: Glyph = IconGauge;
export const Globe: Glyph = IconGlobe;
export const Grid: Glyph = IconGrid3x3;
export const HandCoins: Glyph = IconCashMove;
export const Hash: Glyph = IconHash;
export const Heading1: Glyph = IconH1;
export const History: Glyph = IconHistory;
export const Home: Glyph = IconHome;
export const Hourglass: Glyph = IconHourglass;
export const House: Glyph = IconHome;
export const Image: Glyph = IconPhoto;
export const Inbox: Glyph = IconInbox;
export const Info: Glyph = IconInfoCircle;
export const Italic: Glyph = IconItalic;
export const Kanban: Glyph = IconLayoutKanban;
export const Landmark: Glyph = IconBuildingBank;
export const Layers: Glyph = IconStack2;
export const LayoutGrid: Glyph = IconLayoutGrid;
export const Lightbulb: Glyph = IconBulb;
export const Link: Glyph = IconLink;
export const List: Glyph = IconList;
export const ListChecks: Glyph = IconListCheck;
export const ListFilter: Glyph = IconFilter2;
export const ListTodo: Glyph = IconListDetails;
export const ListTree: Glyph = IconListTree;
export const LoaderCircle: Glyph = IconLoader2;
export const Lock: Glyph = IconLock;
export const LockOpen: Glyph = IconLockOpen;
export const Mail: Glyph = IconMail;
export const Maximize2: Glyph = IconArrowsDiagonal;
export const Menu: Glyph = IconMenu2;
export const MessageSquare: Glyph = IconMessage;
export const MessageSquareText: Glyph = IconMessage2;
export const Minimize2: Glyph = IconArrowsDiagonalMinimize2;
export const Minus: Glyph = IconMinus;
export const Monitor: Glyph = IconDeviceDesktop;
export const MoreHorizontal: Glyph = IconDots;
export const Nfc: Glyph = IconNfc;
export const OctagonAlert: Glyph = IconAlertOctagon;
export const PanelLeft: Glyph = IconLayoutSidebar;
export const Paperclip: Glyph = IconPaperclip;
export const PenLine: Glyph = IconWriting;
export const Pencil: Glyph = IconPencil;
export const Percent: Glyph = IconPercentage;
export const PiggyBank: Glyph = IconPigMoney;
export const Pin: Glyph = IconPin;
export const Plane: Glyph = IconPlane;
export const PlugZap: Glyph = IconPlugConnected;
export const Plus: Glyph = IconPlus;
export const Puzzle: Glyph = IconPuzzle;
export const ReceiptText: Glyph = IconReceipt;
export const RefreshCcw: Glyph = IconRefresh;
export const RefreshCcwDot: Glyph = IconRefreshDot;
export const RefreshCw: Glyph = IconReload;
export const Rocket: Glyph = IconRocket;
export const Save: Glyph = IconDeviceFloppy;
export const ScanFace: Glyph = IconFaceId;
export const Search: Glyph = IconSearch;
export const SearchX: Glyph = IconZoomCancel;
export const Send: Glyph = IconSend;
export const Settings: Glyph = IconSettings;
export const Shapes: Glyph = IconCategory;
export const Share: Glyph = IconShare;
export const ShieldAlert: Glyph = IconShieldExclamation;
export const ShieldCheck: Glyph = IconShieldCheck;
export const ShoppingBag: Glyph = IconShoppingBag;
export const SignalHigh: Glyph = IconAntennaBars5;
export const SignalLow: Glyph = IconAntennaBars2;
export const SignalMedium: Glyph = IconAntennaBars3;
export const SlidersHorizontal: Glyph = IconAdjustmentsHorizontal;
export const Snowflake: Glyph = IconSnowflake;
export const Sparkles: Glyph = IconSparkles;
export const Square: Glyph = IconSquare;
export const SquareArrowOutUpRight: Glyph = IconExternalLink;
export const SquarePen: Glyph = IconEdit;
export const SquareStack: Glyph = IconBoxMultiple;
export const Stamp: Glyph = IconRubberStamp;
export const Star: Glyph = IconStar;
export const Sun: Glyph = IconSun;
export const Table: Glyph = IconTable;
export const Tag: Glyph = IconTag;
export const Target: Glyph = IconTarget;
export const ThumbsDown: Glyph = IconThumbDown;
export const ThumbsUp: Glyph = IconThumbUp;
export const Tractor: Glyph = IconTractor;
export const Trash: Glyph = IconTrash;
export const Trash2: Glyph = IconTrash;
export const TrendingUp: Glyph = IconTrendingUp;
export const Triangle: Glyph = IconTriangle;
export const TriangleAlert: Glyph = IconAlertTriangle;
export const Type: Glyph = IconTypography;
export const Underline: Glyph = IconUnderline;
export const Undo2: Glyph = IconArrowBackUp;
export const Upload: Glyph = IconUpload;
export const User: Glyph = IconUser;
export const UserCheck: Glyph = IconUserCheck;
export const UserRound: Glyph = IconUser;
export const UserRoundCheck: Glyph = IconUserCheck;
export const Users: Glyph = IconUsers;
export const UsersRound: Glyph = IconUsers;
export const Wallet: Glyph = IconWallet;
export const WalletCards: Glyph = IconCards;
export const WalletMinimal: Glyph = IconWallet;
export const Workflow: Glyph = IconSitemap;
export const X: Glyph = IconX;
