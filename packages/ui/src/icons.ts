import type * as React from "react";
import {
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  ArrowDownIcon,
  ArrowDownRightIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  Bars4Icon,
  BellIcon,
  BellSlashIcon,
  BoldIcon,
  BoltIcon,
  BookOpenIcon,
  BookmarkIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CakeIcon,
  CalendarDateRangeIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CreditCardIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FaceSmileIcon,
  FlagIcon,
  FolderIcon,
  FunnelIcon,
  GlobeAltIcon,
  H1Icon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  HashtagIcon,
  HomeIcon,
  InboxIcon,
  InformationCircleIcon,
  ItalicIcon,
  LanguageIcon,
  LightBulbIcon,
  LinkIcon,
  ListBulletIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MapPinIcon,
  MinusIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PauseCircleIcon,
  PencilIcon,
  PencilSquareIcon,
  PercentBadgeIcon,
  PhotoIcon,
  PlusIcon,
  PresentationChartLineIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  ReceiptPercentIcon,
  RectangleGroupIcon,
  RocketLaunchIcon,
  ShareIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ShoppingBagIcon,
  SparklesIcon,
  Square2StackIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
  StarIcon,
  SunIcon,
  TableCellsIcon,
  TagIcon,
  TrashIcon,
  TruckIcon,
  UnderlineIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
  WalletIcon,
  WifiIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import {
  IconAlertOctagonFilled,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars5,
  IconBedFilled,
  IconCircle,
  IconCircleDashed,
  IconCircleDot,
  IconCompassFilled,
  IconDeviceFloppyFilled,
  IconGaugeFilled,
  IconHourglassFilled,
  IconLayoutSidebarFilled,
  IconLoader2,
  IconSitemapFilled,
  IconSquare,
  IconTriangle,
} from "@tabler/icons-react";

/**
 * qui's icon set: every glyph the library and playground use, under one stable qui name. Drawn by Heroicons Solid
 * (MIT, 20px grid, filled), the set Catalyst uses. Where Heroicons has no match the glyph is Tabler's filled one;
 * the work-item state and priority shapes (circles, square, triangle, signal bars) and the spinner stay Tabler
 * outlines, since filling them would change what they mean. Components import from here, never from a pack, so
 * swapping the pack means editing only this file. Use as `<Icon icon={Icons.Settings} />`.
 */
export type Glyph = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const Activity: Glyph = PresentationChartLineIcon as Glyph;
export const AlignCenter: Glyph = Bars3Icon as Glyph;
export const AlignLeft: Glyph = Bars3BottomLeftIcon as Glyph;
export const AlignRight: Glyph = Bars3BottomRightIcon as Glyph;
export const Archive: Glyph = ArchiveBoxIcon as Glyph;
export const ArrowDown: Glyph = ArrowDownIcon as Glyph;
export const ArrowDownRight: Glyph = ArrowDownRightIcon as Glyph;
export const ArrowLeftRight: Glyph = ArrowsRightLeftIcon as Glyph;
export const ArrowRight: Glyph = ArrowRightIcon as Glyph;
export const ArrowUp: Glyph = ArrowUpIcon as Glyph;
export const ArrowUpRight: Glyph = ArrowUpRightIcon as Glyph;
export const Ban: Glyph = NoSymbolIcon as Glyph;
export const Banknote: Glyph = BanknotesIcon as Glyph;
export const BedDouble: Glyph = IconBedFilled as Glyph;
export const Bell: Glyph = BellIcon as Glyph;
export const BellOff: Glyph = BellSlashIcon as Glyph;
export const Bold: Glyph = BoldIcon as Glyph;
export const BookOpen: Glyph = BookOpenIcon as Glyph;
export const Bookmark: Glyph = BookmarkIcon as Glyph;
export const Bot: Glyph = CpuChipIcon as Glyph;
export const Box: Glyph = CubeIcon as Glyph;
export const Briefcase: Glyph = BriefcaseIcon as Glyph;
export const BriefcaseBusiness: Glyph = BriefcaseIcon as Glyph;
export const Building2: Glyph = BuildingOffice2Icon as Glyph;
export const Calendar: Glyph = CalendarIcon as Glyph;
export const CalendarClock: Glyph = CalendarDateRangeIcon as Glyph;
export const CalendarDays: Glyph = CalendarDaysIcon as Glyph;
export const CalendarPlus: Glyph = CalendarIcon as Glyph;
export const Car: Glyph = TruckIcon as Glyph;
export const ChartColumn: Glyph = ChartBarIcon as Glyph;
export const ChartNoAxesCombined: Glyph = PresentationChartLineIcon as Glyph;
export const ChartPie: Glyph = ChartPieIcon as Glyph;
export const Check: Glyph = CheckIcon as Glyph;
export const ChevronDown: Glyph = ChevronDownIcon as Glyph;
export const ChevronLeft: Glyph = ChevronLeftIcon as Glyph;
export const ChevronRight: Glyph = ChevronRightIcon as Glyph;
export const ChevronUp: Glyph = ChevronUpIcon as Glyph;
export const ChevronsLeft: Glyph = ChevronDoubleLeftIcon as Glyph;
export const ChevronsRight: Glyph = ChevronDoubleRightIcon as Glyph;
export const ChevronsUpDown: Glyph = ChevronUpDownIcon as Glyph;
export const Circle: Glyph = IconCircle as Glyph;
export const CircleAlert: Glyph = ExclamationCircleIcon as Glyph;
export const CircleCheck: Glyph = CheckCircleIcon as Glyph;
export const CircleDashed: Glyph = IconCircleDashed as Glyph;
export const CircleDollarSign: Glyph = CurrencyDollarIcon as Glyph;
export const CircleDot: Glyph = IconCircleDot as Glyph;
export const CircleHelp: Glyph = QuestionMarkCircleIcon as Glyph;
export const CircleX: Glyph = XCircleIcon as Glyph;
export const Clock: Glyph = ClockIcon as Glyph;
export const CodeXml: Glyph = CodeBracketIcon as Glyph;
export const Coffee: Glyph = CakeIcon as Glyph;
export const Coins: Glyph = BanknotesIcon as Glyph;
export const Columns3: Glyph = ViewColumnsIcon as Glyph;
export const Compass: Glyph = IconCompassFilled as Glyph;
export const Component: Glyph = RectangleGroupIcon as Glyph;
export const Copy: Glyph = DocumentDuplicateIcon as Glyph;
export const CreditCard: Glyph = CreditCardIcon as Glyph;
export const Database: Glyph = CircleStackIcon as Glyph;
export const Download: Glyph = ArrowDownTrayIcon as Glyph;
export const Ellipsis: Glyph = EllipsisHorizontalIcon as Glyph;
export const ExternalLink: Glyph = ArrowTopRightOnSquareIcon as Glyph;
export const Eye: Glyph = EyeIcon as Glyph;
export const FileImage: Glyph = PhotoIcon as Glyph;
export const FileSpreadsheet: Glyph = DocumentChartBarIcon as Glyph;
export const FileText: Glyph = DocumentTextIcon as Glyph;
export const Filter: Glyph = FunnelIcon as Glyph;
export const Flag: Glyph = FlagIcon as Glyph;
export const Folder: Glyph = FolderIcon as Glyph;
export const Gauge: Glyph = IconGaugeFilled as Glyph;
export const Globe: Glyph = GlobeAltIcon as Glyph;
export const Grid: Glyph = TableCellsIcon as Glyph;
export const HandCoins: Glyph = CurrencyDollarIcon as Glyph;
export const Hash: Glyph = HashtagIcon as Glyph;
export const Heading1: Glyph = H1Icon as Glyph;
export const History: Glyph = ClockIcon as Glyph;
export const Home: Glyph = HomeIcon as Glyph;
export const Hourglass: Glyph = IconHourglassFilled as Glyph;
export const House: Glyph = HomeIcon as Glyph;
export const Image: Glyph = PhotoIcon as Glyph;
export const Inbox: Glyph = InboxIcon as Glyph;
export const Info: Glyph = InformationCircleIcon as Glyph;
export const Italic: Glyph = ItalicIcon as Glyph;
export const Kanban: Glyph = ViewColumnsIcon as Glyph;
export const Landmark: Glyph = BuildingLibraryIcon as Glyph;
export const Layers: Glyph = Square3Stack3DIcon as Glyph;
export const LayoutGrid: Glyph = Squares2X2Icon as Glyph;
export const Lightbulb: Glyph = LightBulbIcon as Glyph;
export const Link: Glyph = LinkIcon as Glyph;
export const List: Glyph = ListBulletIcon as Glyph;
export const ListChecks: Glyph = ClipboardDocumentCheckIcon as Glyph;
export const ListFilter: Glyph = FunnelIcon as Glyph;
export const ListTodo: Glyph = QueueListIcon as Glyph;
export const ListTree: Glyph = Bars4Icon as Glyph;
export const LoaderCircle: Glyph = IconLoader2 as Glyph;
export const Lock: Glyph = LockClosedIcon as Glyph;
export const LockOpen: Glyph = LockOpenIcon as Glyph;
export const Mail: Glyph = EnvelopeIcon as Glyph;
export const Maximize2: Glyph = ArrowsPointingOutIcon as Glyph;
export const Menu: Glyph = Bars3Icon as Glyph;
export const MessageSquare: Glyph = ChatBubbleLeftIcon as Glyph;
export const MessageSquareText: Glyph = ChatBubbleBottomCenterTextIcon as Glyph;
export const Minimize2: Glyph = ArrowsPointingInIcon as Glyph;
export const Minus: Glyph = MinusIcon as Glyph;
export const Monitor: Glyph = ComputerDesktopIcon as Glyph;
export const MoreHorizontal: Glyph = EllipsisHorizontalIcon as Glyph;
export const Nfc: Glyph = WifiIcon as Glyph;
export const OctagonAlert: Glyph = IconAlertOctagonFilled as Glyph;
export const PanelLeft: Glyph = IconLayoutSidebarFilled as Glyph;
export const Paperclip: Glyph = PaperClipIcon as Glyph;
export const PenLine: Glyph = PencilSquareIcon as Glyph;
export const Pencil: Glyph = PencilIcon as Glyph;
export const Percent: Glyph = PercentBadgeIcon as Glyph;
export const PiggyBank: Glyph = WalletIcon as Glyph;
export const Pin: Glyph = MapPinIcon as Glyph;
export const Plane: Glyph = PaperAirplaneIcon as Glyph;
export const PlugZap: Glyph = BoltIcon as Glyph;
export const Plus: Glyph = PlusIcon as Glyph;
export const Puzzle: Glyph = PuzzlePieceIcon as Glyph;
export const ReceiptText: Glyph = ReceiptPercentIcon as Glyph;
export const RefreshCcw: Glyph = ArrowPathIcon as Glyph;
export const RefreshCcwDot: Glyph = ArrowPathRoundedSquareIcon as Glyph;
export const RefreshCw: Glyph = ArrowPathIcon as Glyph;
export const Rocket: Glyph = RocketLaunchIcon as Glyph;
export const Save: Glyph = IconDeviceFloppyFilled as Glyph;
export const ScanFace: Glyph = FaceSmileIcon as Glyph;
export const Search: Glyph = MagnifyingGlassIcon as Glyph;
export const SearchX: Glyph = MagnifyingGlassMinusIcon as Glyph;
export const Send: Glyph = PaperAirplaneIcon as Glyph;
export const Settings: Glyph = Cog6ToothIcon as Glyph;
export const Shapes: Glyph = RectangleGroupIcon as Glyph;
export const Share: Glyph = ShareIcon as Glyph;
export const ShieldAlert: Glyph = ShieldExclamationIcon as Glyph;
export const ShieldCheck: Glyph = ShieldCheckIcon as Glyph;
export const ShoppingBag: Glyph = ShoppingBagIcon as Glyph;
export const SignalHigh: Glyph = IconAntennaBars5 as Glyph;
export const SignalLow: Glyph = IconAntennaBars2 as Glyph;
export const SignalMedium: Glyph = IconAntennaBars3 as Glyph;
export const SlidersHorizontal: Glyph = AdjustmentsHorizontalIcon as Glyph;
export const Snowflake: Glyph = PauseCircleIcon as Glyph;
export const Sparkles: Glyph = SparklesIcon as Glyph;
export const Square: Glyph = IconSquare as Glyph;
export const SquareArrowOutUpRight: Glyph = ArrowTopRightOnSquareIcon as Glyph;
export const SquarePen: Glyph = PencilSquareIcon as Glyph;
export const SquareStack: Glyph = Square2StackIcon as Glyph;
export const Stamp: Glyph = CheckBadgeIcon as Glyph;
export const Star: Glyph = StarIcon as Glyph;
export const Sun: Glyph = SunIcon as Glyph;
export const Table: Glyph = TableCellsIcon as Glyph;
export const Tag: Glyph = TagIcon as Glyph;
export const Target: Glyph = ViewfinderCircleIcon as Glyph;
export const ThumbsDown: Glyph = HandThumbDownIcon as Glyph;
export const ThumbsUp: Glyph = HandThumbUpIcon as Glyph;
export const Tractor: Glyph = TruckIcon as Glyph;
export const Trash: Glyph = TrashIcon as Glyph;
export const Trash2: Glyph = TrashIcon as Glyph;
export const TrendingUp: Glyph = ArrowTrendingUpIcon as Glyph;
export const Triangle: Glyph = IconTriangle as Glyph;
export const TriangleAlert: Glyph = ExclamationTriangleIcon as Glyph;
export const Type: Glyph = LanguageIcon as Glyph;
export const Underline: Glyph = UnderlineIcon as Glyph;
export const Undo2: Glyph = ArrowUturnLeftIcon as Glyph;
export const Upload: Glyph = ArrowUpTrayIcon as Glyph;
export const User: Glyph = UserIcon as Glyph;
export const UserCheck: Glyph = UserCircleIcon as Glyph;
export const UserRound: Glyph = UserIcon as Glyph;
export const UserRoundCheck: Glyph = UserCircleIcon as Glyph;
export const Users: Glyph = UsersIcon as Glyph;
export const UsersRound: Glyph = UserGroupIcon as Glyph;
export const Wallet: Glyph = WalletIcon as Glyph;
export const WalletCards: Glyph = CreditCardIcon as Glyph;
export const WalletMinimal: Glyph = WalletIcon as Glyph;
export const Workflow: Glyph = IconSitemapFilled as Glyph;
export const X: Glyph = XMarkIcon as Glyph;
